"use client";
import { useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerHistory } from "@/lib/admin/customer-history";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
export function EditCustomerRecord({
  customer,
}: {
  customer: CustomerHistory;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const response = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        bookingIds: customer.bookings.map((b) => b.id),
        firstName: f.get("firstName"),
        lastName: f.get("lastName"),
        phone: f.get("phone"),
        email: f.get("email"),
        address: f.get("address"),
        postcode: f.get("postcode"),
        gender: f.get("gender"),
        occupation: f.get("occupation"),
        dateOfBirth: f.get("dateOfBirth"),
        marketingConsent: f.get("marketingConsent") === "true",
      }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Could not update customer record.");
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
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold hover:border-pink hover:text-pink"
      >
        <Pencil size={13} /> Edit customer record
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
            className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-5 shadow-luxe sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  Customer records
                </p>
                <h2 className="font-display text-3xl">Edit customer record</h2>
                <p className="mt-2 text-xs text-black/45">
                  Updates customer details across their complete treatment
                  history.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input
                  required
                  name="firstName"
                  autoComplete="given-name"
                  defaultValue={customer.firstName}
                  className={cls}
                />
              </Field>
              <Field label="Last name">
                <input required name="lastName" autoComplete="family-name" defaultValue={customer.lastName} className={cls} />
              </Field>
              <Field label="Customer phone">
                <input
                  required
                  name="phone"
                  type="tel"
                  defaultValue={customer.phone}
                  className={cls}
                />
              </Field>
              <Field label="Customer email" wide>
                <input
                  name="email"
                  type="email"
                  defaultValue={customer.email}
                  className={cls}
                />
              </Field>
              <Field label="Gender">
                <select name="gender" defaultValue={customer.gender} className={cls}>
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Occupation">
                <input
                  name="occupation"
                  defaultValue={customer.occupation}
                  className={cls}
                />
              </Field>
              <Field label="Date of birth">
                <input
                  name="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  defaultValue={customer.dateOfBirth}
                  className={cls}
                />
              </Field>
              <Field label="Customer address" wide>
                <textarea
                  name="address"
                  required
                  autoComplete="street-address"
                  rows={3}
                  defaultValue={customer.address}
                  className={cls}
                />
              </Field>
              <Field label="Customer postcode">
                <input name="postcode" required autoComplete="postal-code" defaultValue={customer.postcode} className={`${cls} uppercase`} />
              </Field>
              <Field label="Promotional consent" wide>
                <select
                  name="marketingConsent"
                  defaultValue={String(customer.marketingConsent)}
                  className={cls}
                >
                  <option value="false">No promotional SMS or email</option>
                  <option value="true">Yes, customer opted in</option>
                </select>
              </Field>
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
              {saving ? "Saving changes..." : "Save customer changes"}
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
