import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { LearnerHeader } from "@/components/learner/learner-header";
import { redirect } from "next/navigation";
import { getCurrentLearner } from "@/lib/learner/auth";
import { learnerCourses } from "@/lib/learner/courses";
import {
  getLearnerCourseIds,
  getLearnerSubmissions,
} from "@/lib/learner/storage";
import { getSubmissionStatus } from "@/lib/learner/presentation";
export const dynamic = "force-dynamic";
export default async function LearnerDashboard() {
  const learner = await getCurrentLearner();
  if (!learner) redirect("/learner-login");
  if (learner.mustChangePassword) redirect("/learners/change-password");
  const [ids, submissions] = await Promise.all([
    getLearnerCourseIds(learner.id),
    getLearnerSubmissions(learner.id),
  ]);
  const courses = learnerCourses.filter((c) => ids.includes(c.id));
  return (
    <>
      <LearnerHeader learnerName={learner.name} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-5xl">{learner.name}</h1>
        <p className="mt-3 text-sm text-black/50">
          Only courses assigned to your account are shown here.
        </p>
        <section className="mt-9 grid gap-5">
          {courses.map((course) => {
            const assignmentStates = course.assignments.map((assignment) => ({
              assignment,
              latest: submissions.find((submission) => submission.assignmentId === assignment.id),
            }));
            const passed = assignmentStates.filter(({ latest }) => latest?.status === "passed").length;
            const progress = course.assignments.length ? Math.round((passed / course.assignments.length) * 100) : 0;
            const next = assignmentStates.find(({ latest }) => latest?.status === "changes-requested") || assignmentStates.find(({ latest }) => !latest);
            return (
            <article
              key={course.id}
              className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pink-light text-pink">
                  <BookOpen size={20} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-pink">
                    {course.level}
                  </p>
                  <h2 className="mt-1 font-display text-3xl">{course.title}</h2>
                </div>
              </div>
              {course.assignments.length > 0 && (
                <div className="mt-6 rounded-2xl bg-cream p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <span>Course progress</span><span>{passed} of {course.assignments.length} passed</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-pink transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {next ? (
                    <Link href={`/learners/assignments/${next.assignment.id}`} className="button-primary mt-4 shrink-0 sm:mt-0">
                      {next.latest?.status === "changes-requested" ? "Review feedback" : "Continue learning"} <ArrowRight size={15} />
                    </Link>
                  ) : passed === course.assignments.length ? (
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-green-700 sm:mt-0"><CheckCircle2 size={16} /> All assignments complete</span>
                  ) : (
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-800 sm:mt-0">Awaiting assessor review</span>
                  )}
                </div>
              )}
              <div className="mt-7 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold">Course books</h3>
                  {course.materials.length ? (
                    <div className="mt-3 grid gap-2">
                      {course.materials.map((m) => (
                        <Link
                          key={m.id}
                          href={`/api/learner/files?key=${encodeURIComponent(m.storageKey)}`}
                          className="rounded-xl bg-cream p-4 text-xs font-bold text-pink"
                        >
                          {m.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-cream p-4 text-xs text-black/45">
                      Approved course books will appear here when supplied by
                      Pink.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold">Assignments</h3>
                  {course.assignments.length ? (
                    <div className="mt-3 grid gap-3">
                      {course.assignments.map((a) => {
                        const latest = submissions.find(
                          (s) => s.assignmentId === a.id,
                        );
                        const status = getSubmissionStatus(latest?.status);
                        return (
                          <Link
                            key={a.id}
                            href={`/learners/assignments/${a.id}`}
                            className="rounded-xl border border-black/5 p-4"
                          >
                            <strong className="text-sm">{a.title}</strong>
                            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}>
                              <CheckCircle2 size={13} />
                              {status.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-cream p-4 text-xs text-black/45">
                      Approved assignments will appear here when supplied by
                      Pink.
                    </p>
                  )}
                </div>
              </div>
            </article>
          )})}
          {!courses.length && (
            <p className="rounded-2xl bg-white p-8 text-sm text-black/50">
              No course has been assigned yet. Please contact Pink Academy.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
