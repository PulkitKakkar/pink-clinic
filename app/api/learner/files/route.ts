import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentLearner } from "@/lib/learner/auth";
import { learnerCourses } from "@/lib/learner/courses";
import {
  learnerFileMaxBytes,
  learnerFileS3,
  learnerFileTypes,
  requireLearnerFileBucket,
} from "@/lib/learner/file-storage";
import {
  getLearnerCourseIds,
  getLearnerSubmissions,
} from "@/lib/learner/storage";
export async function POST(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = (await request.json()) as {
    assignmentId?: string;
    name?: string;
    contentType?: string;
    size?: number;
  };
  if (
    !body.assignmentId ||
    !body.name ||
    !body.contentType ||
    !learnerFileTypes.has(body.contentType) ||
    !body.size ||
    body.size > learnerFileMaxBytes
  )
    return NextResponse.json(
      { error: "Only PDF or Word files up to 10 MB are accepted." },
      { status: 400 },
    );
  const course = learnerCourses.find((c) =>
    c.assignments.some((a) => a.id === body.assignmentId),
  );
  if (!course || !(await getLearnerCourseIds(learner.id)).includes(course.id))
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  const key = `learner-submissions/${learner.id}/${randomUUID()}`;
  const uploadUrl = await getSignedUrl(
    learnerFileS3,
    new PutObjectCommand({
      Bucket: requireLearnerFileBucket(),
      Key: key,
      ContentType: body.contentType,
    }),
    { expiresIn: 300 },
  );
  return NextResponse.json({ key, uploadUrl });
}
export async function GET(request: Request) {
  const learner = await getCurrentLearner();
  if (!learner)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const key = new URL(request.url).searchParams.get("key") || "";
  const courseIds = await getLearnerCourseIds(learner.id);
  const materialAllowed = learnerCourses
    .filter((c) => courseIds.includes(c.id))
    .flatMap((c) => c.materials)
    .some((m) => m.storageKey === key);
  const submissionAllowed = (await getLearnerSubmissions(learner.id)).some(
    (s) => s.files.some((f) => f.key === key),
  );
  if (!materialAllowed && !submissionAllowed)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = await getSignedUrl(
    learnerFileS3,
    new GetObjectCommand({ Bucket: requireLearnerFileBucket(), Key: key }),
    { expiresIn: 120 },
  );
  return NextResponse.redirect(url, 303);
}
