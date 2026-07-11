"use client";
import { useState } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Branch } from "@/lib/branches";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
export function AddCustomerHistory({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId: f.get("branchId"),
        serviceId: "manual",
        treatmentName: f.get("treatmentName"),
        durationMinutes: Number(f.get("durationMinutes")),
        staffId: "manual",
        practitionerName: f.get("practitionerName"),
        customerName: f.get("customerName"),
        customerPhone: f.get("customerPhone"),
        customerEmail: f.get("customerEmail"),
        marketingConsent: f.get("marketingConsent") === "on",
        startsAt: new Date(String(f.get("startsAt"))).toISOString(),
        notes: f.get("notes"),
        historicalRecord: true,
        suppressNotification: true,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Could not save customer history.");
      return;
    }
    setOpen(false);
    router.refresh();
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="button-primary"
      >
        <Plus size={14} /> Add existing record
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-[#16010d]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={submit}
            className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  Paper records
                </p>
                <h2 className="font-display text-3xl">
                  Add existing customer history
                </h2>
                <p className="mt-2 text-xs text-black/45">
                  Saved as a completed historical visit. No notification or
                  reminder will be sent.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Customer name">
                <input required name="customerName" className={cls} />
              </Field>
              <Field label="Customer phone">
                <input
                  required
                  name="customerPhone"
                  type="tel"
                  className={cls}
                />
              </Field>
              <Field label="Customer email" wide>
                <input name="customerEmail" type="email" className={cls} />
              </Field>
              <Field label="Branch">
                <select name="branchId" className={cls}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Visit date and time">
                <input
                  required
                  name="startsAt"
                  type="datetime-local"
                  className={cls}
                />
              </Field>
              <Field label="Treatment">
                <input required name="treatmentName" className={cls} />
              </Field>
              <Field label="Duration (minutes)">
                <input
                  required
                  name="durationMinutes"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  defaultValue="60"
                  className={cls}
                />
              </Field>
              <Field label="Practitioner" wide>
                <input required name="practitionerName" className={cls} />
              </Field>
              <Field label="Historical notes" wide>
                <textarea name="notes" rows={5} className={cls} />
              </Field>
              <label className="flex gap-3 rounded-xl bg-pink-light/35 p-4 text-xs sm:col-span-2">
                <input
                  name="marketingConsent"
                  type="checkbox"
                  className="accent-pink"
                />
                <span>
                  <strong className="block">
                    Recorded promotional consent
                  </strong>
                  Only tick when the paper record contains valid consent.
                </span>
              </label>
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={saving}
              className="button-primary mt-5"
              type="submit"
            >
              {saving && <LoaderCircle className="animate-spin" size={14} />}{" "}
              {saving ? "Saving record..." : "Save historical record"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`grid gap-2 text-xs font-bold ${wide ? "sm:col-span-2" : ""}`}
    >
      {label}
      {children}
    </label>
  );
}
