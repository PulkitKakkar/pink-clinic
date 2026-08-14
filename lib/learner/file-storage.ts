import "server-only";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { SubmissionFile } from "@/lib/learner/storage";
export const learnerFileBucket =
  process.env.LEARNER_FILES_BUCKET || process.env.TREATMENT_IMAGES_BUCKET || "";
export const learnerFileRegion =
  process.env.LEARNER_FILES_REGION ||
  process.env.TREATMENT_IMAGES_REGION ||
  process.env.AWS_REGION ||
  "eu-west-2";
export const learnerFileS3 = new S3Client({ region: learnerFileRegion });
export const learnerFileTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export const learnerFileMaxBytes = 10 * 1024 * 1024;
export function requireLearnerFileBucket() {
  if (!learnerFileBucket)
    throw new Error("LEARNER_FILES_BUCKET is not configured.");
  return learnerFileBucket;
}
export async function verifySubmissionFiles(
  learnerId: string,
  files: SubmissionFile[],
) {
  if (files.length > 5) throw new Error("A maximum of five files is allowed.");
  for (const file of files) {
    if (
      !file.key.startsWith(`learner-submissions/${learnerId}/`) ||
      !learnerFileTypes.has(file.contentType) ||
      file.size > learnerFileMaxBytes
    )
      throw new Error("Invalid submission file.");
    const head = await learnerFileS3.send(
      new HeadObjectCommand({
        Bucket: requireLearnerFileBucket(),
        Key: file.key,
      }),
    );
    if (
      !head.ContentLength ||
      head.ContentLength > learnerFileMaxBytes ||
      head.ContentType !== file.contentType
    )
      throw new Error("Uploaded file could not be verified.");
  }
}
