import Link from "next/link";
import { BookOpen, CheckCircle2, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentLearner } from "@/lib/learner/auth";
import { learnerCourses } from "@/lib/learner/courses";
import {
  getLearnerCourseIds,
  getLearnerSubmissions,
} from "@/lib/learner/storage";
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
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div>
            <strong>Pink Academy</strong>
            <p className="text-xs text-black/45">Learner portal</p>
          </div>
          <form action="/api/learner/logout" method="post">
            <button className="flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-4 text-xs font-bold">
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-5xl">{learner.name}</h1>
        <p className="mt-3 text-sm text-black/50">
          Only courses assigned to your account are shown here.
        </p>
        <section className="mt-9 grid gap-5">
          {courses.map((course) => (
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
                        return (
                          <Link
                            key={a.id}
                            href={`/learners/assignments/${a.id}`}
                            className="rounded-xl border border-black/5 p-4"
                          >
                            <strong className="text-sm">{a.title}</strong>
                            <span className="mt-2 flex items-center gap-1 text-xs text-pink">
                              <CheckCircle2 size={13} />
                              {latest
                                ? latest.status.replaceAll("-", " ")
                                : "Not submitted"}
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
          ))}
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
