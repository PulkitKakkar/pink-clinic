import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentLearner } from "@/lib/learner/auth";
export const metadata = {
  title: "Learner sign in",
  robots: { index: false, follow: false },
};
export default async function LearnerLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentLearner()) redirect("/learners");
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#210013] px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-luxe">
        <Image
          src="/images/pink-logo.jpeg"
          alt="Pink Beauty"
          width={160}
          height={80}
          className="mx-auto h-auto w-32"
        />
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[.22em] text-pink">
          Pink Academy
        </p>
        <h1 className="mt-2 text-center font-display text-4xl">
          Learner sign in
        </h1>
        <p className="mt-3 text-center text-xs leading-5 text-black/45">
          Use the credentials supplied by Pink. Learners cannot create their own
          accounts.
        </p>
        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-700">
            {error === "rate-limit"
              ? "Too many attempts. Please wait 15 minutes."
              : "Incorrect email or password."}
          </p>
        )}
        <form
          action="/api/learner/login"
          method="post"
          className="mt-7 grid gap-4"
        >
          <label className="grid gap-2 text-xs font-bold">
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="rounded-xl border border-black/10 bg-cream px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border border-black/10 bg-cream px-4 py-3"
            />
          </label>
          <button className="button-primary mt-2 w-full">Sign in</button>
        </form>
        <div className="mt-6 border-t border-black/5 pt-5 text-center text-xs leading-5 text-black/50">
          <p className="font-bold text-black/70">Can&apos;t access your account?</p>
          <p>Password resets are handled securely by Pink Academy.</p>
          <a href="mailto:info@pinkbeautysalons.co.uk?subject=Pink%20Academy%20account%20help" className="mt-2 inline-block font-bold text-pink">Email learner support</a>
          <span className="mx-2">·</span>
          <a href="tel:+441189962711" className="font-bold text-pink">0118 996 2711</a>
        </div>
      </div>
    </main>
  );
}
