import { notFound, redirect } from "next/navigation";
import { AssignmentSubmission } from "@/components/learner/assignment-submission";
import { LearnerHeader } from "@/components/learner/learner-header";
import { getCurrentLearner } from "@/lib/learner/auth";
import { getLearnerAssignment } from "@/lib/learner/courses";
import {
  getLearnerCourseIds,
  getLearnerSubmissions,
} from "@/lib/learner/storage";
import { getSubmissionStatus } from "@/lib/learner/presentation";
export default async function AssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ assignmentId: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const learner = await getCurrentLearner();
  if (!learner) redirect("/learner-login");
  if (learner.mustChangePassword) redirect("/learners/change-password");
  const entry = getLearnerAssignment((await params).assignmentId);
  if (!entry) notFound();
  if (!(await getLearnerCourseIds(learner.id)).includes(entry.course.id))
    notFound();
  const attempts = (await getLearnerSubmissions(learner.id)).filter(
    (s) => s.assignmentId === entry.assignment.id,
  );
  const latest = attempts[0];
  const canSubmit = !latest || latest.status === "changes-requested";
  const latestStatus = getSubmissionStatus(latest?.status);
  const justSubmitted = (await searchParams).submitted === "1";
  return (
    <>
    <LearnerHeader learnerName={learner.name} />
    <main className="mx-auto max-w-4xl px-5 py-12">
      <a href="/learners" className="text-xs font-bold text-pink">
        ← Dashboard
      </a>
      <p className="eyebrow mt-7">{entry.course.level} assignment</p>
      <h1 className="mt-2 font-display text-5xl">{entry.assignment.title}</h1>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/60">
        {entry.assignment.instructions}
      </p>
      {justSubmitted && <p role="status" className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">Your assignment was submitted successfully. Pink Academy will update the status after assessment.</p>}
      {entry.assignment.briefStorageKey && (
        <a
          href={`/api/learner/files?key=${encodeURIComponent(entry.assignment.briefStorageKey)}`}
          className="mt-5 inline-flex rounded-full bg-pink px-5 py-3 text-xs font-bold text-white"
        >
          Download assignment brief
        </a>
      )}
      {latest && (
        <section className="mt-8 rounded-2xl bg-white p-6">
          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${latestStatus.className}`}>{latestStatus.label}</span>
          <p className="mt-3 text-sm text-black/60">{latestStatus.guidance}</p>
          {latest.feedback && (
            <p className="mt-3 text-sm leading-6 text-black/60">
              <b>Pink feedback:</b> {latest.feedback}
            </p>
          )}
          <p className="mt-3 text-xs text-black/40">
            Attempt {latest.attempt} ·{" "}
            {new Date(latest.submittedAt).toLocaleString("en-GB")}
          </p>
        </section>
      )}
      {canSubmit && <AssignmentSubmission assignmentId={entry.assignment.id} />}
      <section className="mt-8">
        <h2 className="font-display text-3xl">Previous attempts</h2>
        {attempts.map((a) => (
          <article
            key={a.id}
            className="mt-3 rounded-xl border border-black/5 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold">Attempt {a.attempt}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getSubmissionStatus(a.status).className}`}>{getSubmissionStatus(a.status).label}</span></div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-black/55">
              {a.writtenAnswer || "File submission"}
            </p>
            {a.files.map((f) => (
              <a
                key={f.key}
                href={`/api/learner/files?key=${encodeURIComponent(f.key)}`}
                className="mt-2 block text-xs font-bold text-pink"
              >
                Download {f.name}
              </a>
            ))}
          </article>
        ))}
      </section>
    </main>
    </>
  );
}
