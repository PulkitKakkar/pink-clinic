import { NextResponse } from "next/server";
import { getCurrentLearner } from "@/lib/learner/auth";
import { getLearnerAssignment } from "@/lib/learner/courses";
import {
  createSubmission,
  getLearnerCourseIds,
  getLearnerSubmissions,
  type SubmissionFile,
} from "@/lib/learner/storage";
import { getPublicOrigin } from "@/lib/public-origin";
import { verifySubmissionFiles } from "@/lib/learner/file-storage";
export async function POST(request: Request) {
  const isInline = request.headers.get("x-requested-with") === "learner-submission-form";
  const learner = await getCurrentLearner();
  if (!learner)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const form = await request.formData();
  const assignmentId = String(form.get("assignmentId") || "");
  const entry = getLearnerAssignment(assignmentId);
  if (
    !entry ||
    !(await getLearnerCourseIds(learner.id)).includes(entry.course.id)
  )
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  const latest = (await getLearnerSubmissions(learner.id)).find(
    (s) => s.assignmentId === assignmentId,
  );
  if (latest && latest.status !== "changes-requested")
    return NextResponse.json(
      { error: "This assignment cannot currently be resubmitted." },
      { status: 409 },
    );
  const writtenAnswer = String(form.get("writtenAnswer") || "").trim();
  let files: SubmissionFile[] = [];
  try {
    files = JSON.parse(String(form.get("files") || "[]"));
  } catch {}
  if (!writtenAnswer && !files.length)
    return NextResponse.json(
      { error: "Add a written answer or file." },
      { status: 400 },
    );
  await verifySubmissionFiles(learner.id, files);
  await createSubmission({
    learnerId: learner.id,
    courseId: entry.course.id,
    assignmentId,
    writtenAnswer,
    files,
  });
  const redirectTo = `/learners/assignments/${assignmentId}?submitted=1`;
  return isInline
    ? NextResponse.json({ redirectTo })
    : NextResponse.redirect(new URL(redirectTo, getPublicOrigin(request)), 303);
}
