"use client";

import { FormEvent, ReactNode, useState } from "react";

const passwordChecks = [
  { label: "At least 12 characters", test: (value: string) => value.length >= 12 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
  { label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

type Props =
  | { mode: "create"; children: ReactNode }
  | { mode: "reset"; learnerId: string; learnerName: string };

export function LearnerCredentialForm(props: Props) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const isCreate = props.mode === "create";
  const passwordIsValid = passwordChecks.every(({ test }) => test(password));
  const passwordsMatch = confirmation.length > 0 && confirmation === password;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError("");
    const form = event.currentTarget;
    if (!form.checkValidity() || !passwordIsValid || !passwordsMatch) {
      form.reportValidity();
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "learner-credential-form" },
      });
      const result = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) throw new Error(result.error || "Could not save the learner.");
      window.location.assign(result.redirectTo || "/academy-admin?updated=credentials");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not save the learner.");
      setSaving(false);
    }
  }

  return (
    <form action="/api/academy-admin/learners" method="post" onSubmit={submit} className={isCreate ? "mt-5 grid gap-4" : "grid gap-3"} noValidate>
      <input type="hidden" name="action" value={isCreate ? "create" : "reset"} />
      {!isCreate && <input type="hidden" name="learnerId" value={props.learnerId} />}
      {isCreate && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-bold">
            Full name
            <input name="name" required minLength={2} autoComplete="name" className="rounded-xl border border-black/10 p-3 font-normal" />
            <span className="text-[11px] font-normal text-black/45">Enter the learner&apos;s first and last name.</span>
          </label>
          <label className="grid gap-1 text-xs font-bold">
            Email address
            <input name="email" type="email" required autoComplete="email" className="rounded-xl border border-black/10 p-3 font-normal" />
            <span className="text-[11px] font-normal text-black/45">This will be used to sign in.</span>
          </label>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid content-start gap-1 text-xs font-bold">
          {isCreate ? "Initial password" : `New password for ${props.learnerName}`}
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={`${isCreate ? "create" : props.learnerId}-password-rules`}
            className="rounded-xl border border-black/10 p-3 font-normal"
          />
        </label>
        <label className="grid content-start gap-1 text-xs font-bold">
          Confirm password
          <input
            name="confirmation"
            type="password"
            required
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            aria-invalid={submitted && !passwordsMatch}
            className="rounded-xl border border-black/10 p-3 font-normal aria-[invalid=true]:border-red-500"
          />
          {confirmation && !passwordsMatch && <span className="text-[11px] font-normal text-red-700">Passwords do not match.</span>}
        </label>
      </div>
      <ul id={`${isCreate ? "create" : props.learnerId}-password-rules`} className="grid gap-1 text-[11px] sm:grid-cols-2">
        {passwordChecks.map(({ label, test }) => {
          const passed = test(password);
          return <li key={label} className={password ? (passed ? "text-green-700" : "text-red-700") : "text-black/45"}>{passed ? "✓" : "○"} {label}</li>;
        })}
      </ul>
      {isCreate && props.children}
      {submitted && !passwordIsValid && <p className="text-xs font-bold text-red-700" role="alert">Please meet every password requirement.</p>}
      {serverError && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700" role="alert">{serverError}</p>}
      <button disabled={saving} className={`${isCreate ? "button-primary w-fit" : "rounded-full bg-[#210013] px-4 py-3 text-xs font-bold text-white"} disabled:cursor-wait disabled:opacity-60`}>
        {saving ? "Saving…" : isCreate ? "Create learner" : "Reset password"}
      </button>
    </form>
  );
}
