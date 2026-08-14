import Image from "next/image";

export default async function AcademyAdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-luxe sm:p-10">
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
          Academy administrator
        </h1>
        <p className="mt-3 text-center text-xs leading-5 text-black/45">
          Manage learner accounts, course access and assignment reviews.
        </p>
        {params.error && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-700">
            {params.error === "rate-limit"
              ? "Too many attempts. Please wait 15 minutes."
              : "Incorrect email or password."}
          </p>
        )}
        <form
          action="/api/academy-admin/login"
          method="post"
          className="mt-7 grid gap-4"
        >
          <input type="hidden" name="next" value={params.next || "/academy-admin"} />
          <label className="grid gap-2 text-xs font-bold">
            Email
            <input name="email" type="email" required autoComplete="username" className="rounded-xl border border-black/10 bg-cream px-4 py-3" />
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="rounded-xl border border-black/10 bg-cream px-4 py-3" />
          </label>
          <button className="button-primary mt-2 w-full">Sign in</button>
        </form>
      </div>
    </main>
  );
}
