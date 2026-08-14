import { AcademyHeader } from "@/components/academy/academy-header";
import { LearnerCredentialForm } from "@/components/academy/learner-credential-form";
import { learnerCourses } from "@/lib/learner/courses";
import { listLearners, listSubmissions } from "@/lib/learner/storage";
export const dynamic = "force-dynamic";
export default async function LearnersAdmin() {
  const [learners, submissions] = await Promise.all([
    listLearners(),
    listSubmissions(),
  ]);
  return (
    <>
      <AcademyHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="eyebrow">Pink Academy</p>
        <h1 className="mt-2 font-display text-5xl">Learners</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
          Root administrators create every account and control exactly which
          individual courses it can access.
        </p>
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl">Create learner</h2>
          <LearnerCredentialForm mode="create">
            <CourseChecks />
          </LearnerCredentialForm>
        </section>
        <section className="mt-8 grid gap-4">
          {learners.map((l) => (
            <article
              key={l.id}
              className="rounded-2xl bg-white p-6 shadow-soft"
            >
              <h2 className="font-display text-3xl">{l.name}</h2>
              <p className="text-xs text-black/45">
                {l.email} · {l.active ? "Active" : "Disabled"}
                {l.mustChangePassword ? " · Password change required" : ""}
              </p>
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action="/api/academy-admin/learners" method="post">
                  <input type="hidden" name="action" value="courses" />
                  <input type="hidden" name="learnerId" value={l.id} />
                  <CourseChecks selected={l.courseIds} />
                  <button className="mt-3 rounded-full border border-pink/20 px-4 py-2 text-xs font-bold text-pink">
                    Save courses
                  </button>
                </form>
                <LearnerCredentialForm mode="reset" learnerId={l.id} learnerName={l.name} />
              </div>
            </article>
          ))}
        </section>
        <section className="mt-12">
          <h2 className="font-display text-4xl">Assignment submissions</h2>
          <div className="mt-5 grid gap-4">
            {submissions.map((s) => (
              <article key={s.id} className="rounded-2xl bg-white p-6">
                <p className="text-xs font-bold text-pink">
                  {s.learnerName} · Attempt {s.attempt}
                </p>
                <h3 className="mt-2 text-lg font-bold">{s.assignmentId}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-black/55">
                  {s.writtenAnswer || "File-only submission"}
                </p>
                {s.files.map((f) => (
                  <span
                    key={f.key}
                    className="mt-2 block text-xs font-bold text-pink"
                  >
                    {f.name}
                  </span>
                ))}
                <form
                  action="/api/academy-admin/learners"
                  method="post"
                  className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto]"
                >
                  <input type="hidden" name="action" value="review" />
                  <input type="hidden" name="submissionId" value={s.id} />
                  <select
                    name="status"
                    defaultValue={s.status}
                    className="rounded-xl border border-black/10 p-3 text-xs"
                  >
                    <option value="under-review">Under review</option>
                    <option value="changes-requested">Changes requested</option>
                    <option value="passed">Passed</option>
                  </select>
                  <input
                    name="feedback"
                    defaultValue={s.feedback}
                    placeholder="Feedback"
                    className="rounded-xl border border-black/10 p-3 text-xs"
                  />
                  <button className="button-primary">Save review</button>
                </form>
              </article>
            ))}
            {!submissions.length && (
              <p className="rounded-2xl bg-white p-6 text-sm text-black/45">
                No submissions yet.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
function CourseChecks({ selected = [] }: { selected?: string[] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold">Course access</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {learnerCourses.map((c) => (
          <label
            key={c.id}
            className="flex gap-2 rounded-xl bg-cream p-3 text-xs"
          >
            <input
              type="checkbox"
              name="courseId"
              value={c.id}
              defaultChecked={selected.includes(c.id)}
            />
            {c.title}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
