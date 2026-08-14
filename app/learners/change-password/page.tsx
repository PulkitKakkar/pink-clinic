import { redirect } from "next/navigation";
import { PasswordChangeForm } from "@/components/learner/password-change-form";
import { getCurrentLearner } from "@/lib/learner/auth";
export default async function ChangePassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const learner = await getCurrentLearner();
  if (!learner) redirect("/learner-login");
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft">
        <p className="eyebrow">Account security</p>
        <h1 className="mt-2 font-display text-4xl">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          Use at least 12 characters with uppercase, lowercase, a number and a
          symbol.
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
            The passwords did not match or were not strong enough.
          </p>
        )}
        <PasswordChangeForm />
      </div>
    </main>
  );
}
