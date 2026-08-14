"use client";

import { FormEvent, useState } from "react";

const checks = [
  ["At least 12 characters", (value: string) => value.length >= 12],
  ["One uppercase letter", (value: string) => /[A-Z]/.test(value)],
  ["One lowercase letter", (value: string) => /[a-z]/.test(value)],
  ["One number", (value: string) => /\d/.test(value)],
  ["One special character", (value: string) => /[^A-Za-z0-9]/.test(value)],
] as const;

export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const valid = checks.every(([, test]) => test(password));
  const matches = confirmation.length > 0 && password === confirmation;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!valid) return setError("Please meet every password requirement.");
    if (!matches) return setError("The passwords do not match.");
    setSaving(true);
    try {
      const response = await fetch(event.currentTarget.action, {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { "X-Requested-With": "learner-password-form" },
      });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) throw new Error(result.error || "Could not save your password.");
      window.location.assign(result.redirectTo || "/learners");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your password.");
      setSaving(false);
    }
  }

  return (
    <form action="/api/learner/password" method="post" onSubmit={submit} className="mt-6 grid gap-4" noValidate>
      <label className="grid gap-2 text-xs font-bold">New password
        <input name="password" type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-black/10 p-3 font-normal" />
      </label>
      <label className="grid gap-2 text-xs font-bold">Confirm new password
        <input name="confirmation" type="password" required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} aria-invalid={Boolean(confirmation) && !matches} className="rounded-xl border border-black/10 p-3 font-normal aria-[invalid=true]:border-red-500" />
        {confirmation && !matches && <span className="font-normal text-red-700">Passwords do not match.</span>}
      </label>
      <ul className="grid gap-1 text-[11px] sm:grid-cols-2" aria-label="Password requirements">
        {checks.map(([label, test]) => {
          const passed = test(password);
          return <li key={label} className={password ? (passed ? "text-green-700" : "text-red-700") : "text-black/45"}>{passed ? "✓" : "○"} {label}</li>;
        })}
      </ul>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      <button disabled={saving} className="button-primary disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Save password"}</button>
    </form>
  );
}
