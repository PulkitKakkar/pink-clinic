"use client";
import { useState } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerHistory } from "@/lib/admin/customer-history";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
export function AddCustomerHistory({
  customers,
  initialCustomerId = "",
  label = "Add customer record",
}: {
  customers: CustomerHistory[];
  initialCustomerId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(initialCustomerId);
  const customer = customers.find((c) => c.id === selected);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const consultation = String(f.get("consultation") || "").trim();
    const outcome = String(f.get("outcome") || "").trim();
    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId: "reading-west-street",
        serviceId: "manual",
        treatmentName: f.get("treatmentName"),
        durationMinutes: 5,
        staffId: "manual",
        practitionerName: "Historical record",
        customerName: f.get("customerName"),
        customerPhone: f.get("customerPhone"),
        customerEmail: f.get("customerEmail"),
        customerAddress: f.get("customerAddress"),
        marketingConsent: f.get("marketingConsent") === "on",
        startsAt: new Date().toISOString(),
        notes: `Session: ${f.get("sessionNumber") || ""} of ${f.get("totalSessions") || ""}\n\nConsultation:\n${consultation || "Not recorded"}\n\nOutcome:\n${outcome || "Not recorded"}`,
        historicalRecord: true,
        suppressNotification: true,
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Could not save customer record.");
      return;
    }
    setOpen(false);
    setSelected("");
    router.refresh();
  }
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelected(initialCustomerId);
          setOpen(true);
        }}
        className="button-primary"
      >
        <Plus size={14} /> {label}
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
                  Customer records
                </p>
                <h2 className="font-display text-3xl">
                  Add customer treatment record
                </h2>
                <p className="mt-2 text-xs text-black/45">
                  Create a customer or add another treatment to an existing
                  customer.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Existing customer" wide>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className={cls}
                >
                  <option value="">New customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Customer name">
                <input
                  key={`name-${selected}`}
                  required
                  name="customerName"
                  defaultValue={customer?.name || ""}
                  className={cls}
                />
              </Field>
              <Field label="Customer phone">
                <input
                  key={`phone-${selected}`}
                  required
                  name="customerPhone"
                  type="tel"
                  defaultValue={customer?.phone || ""}
                  className={cls}
                />
              </Field>
              <Field label="Customer email" wide>
                <input
                  key={`email-${selected}`}
                  name="customerEmail"
                  type="email"
                  defaultValue={customer?.email || ""}
                  className={cls}
                />
              </Field>
              <Field label="Customer address" wide>
                <textarea
                  key={`address-${selected}`}
                  name="customerAddress"
                  rows={3}
                  defaultValue={customer?.address || ""}
                  className={cls}
                />
              </Field>
              <Field label="Treatment" wide>
                <input required name="treatmentName" className={cls} />
              </Field>
              <Field label="Session number">
                <input
                  name="sessionNumber"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  className={cls}
                />
              </Field>
              <Field label="Total sessions booked">
                <input
                  name="totalSessions"
                  type="number"
                  min="1"
                  placeholder="e.g. 6"
                  className={cls}
                />
              </Field>
              <Field label="Consultation sheet / consultation details" wide>
                <textarea
                  required
                  name="consultation"
                  rows={5}
                  className={cls}
                />
              </Field>
              <Field label="Outcome" wide>
                <textarea required name="outcome" rows={4} className={cls} />
              </Field>
              <label className="flex gap-3 rounded-xl bg-pink-light/35 p-4 text-xs sm:col-span-2">
                <input
                  key={`consent-${selected}`}
                  name="marketingConsent"
                  type="checkbox"
                  defaultChecked={customer?.marketingConsent || false}
                  className="accent-pink"
                />
                <span>
                  <strong className="block">
                    Recorded promotional consent
                  </strong>
                  Only tick when valid consent has been recorded.
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
              {saving ? "Saving record..." : "Save customer record"}
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
