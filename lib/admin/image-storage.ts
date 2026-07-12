import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

export const treatmentImageBucket = process.env.TREATMENT_IMAGES_BUCKET || "";
export const treatmentImageRegion = process.env.TREATMENT_IMAGES_REGION || process.env.AWS_REGION || "eu-west-2";

export class ImageStorageConfigurationError extends Error {}

export function requireImageBucket() {
  if (!treatmentImageBucket) throw new ImageStorageConfigurationError("TREATMENT_IMAGES_BUCKET is not configured.");
  return treatmentImageBucket;
}

export const treatmentImageS3 = new S3Client({ region: treatmentImageRegion });
