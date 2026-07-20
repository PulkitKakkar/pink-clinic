"use client";
import { useState } from "react";
import { LoaderCircle, Plus, Search, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerHistory } from "@/lib/admin/customer-history";
import { AddressLookup } from "@/components/admin/address-lookup";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { SearchableOptionInput } from "@/components/admin/searchable-option-input";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
export function AddCustomerHistory({
  customers,
  initialCustomerId = "",
  label = "Add customer record",
  treatmentNames,
}: {
  customers: CustomerHistory[];
  initialCustomerId?: string;
  label?: string;
  treatmentNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(initialCustomerId);
  const initialCustomer = customers.find((c) => c.id === initialCustomerId);
  const [customerQuery, setCustomerQuery] = useState(initialCustomer?.name || "");
  const [showLookup, setShowLookup] = useState(false);
  const [images, setImages] = useState<TreatmentImage[]>([]);
  const customer = customers.find((c) => c.id === selected);
  const normalizedQuery = customerQuery.trim().toLowerCase();
  const matchingCustomers = normalizedQuery
    ? customers
        .filter((item) =>
          [item.name, item.phone, item.email].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          ),
        )
        .slice(0, 8)
    : [];

  function selectCustomer(nextCustomer: CustomerHistory) {
    setSelected(nextCustomer.id);
    setCustomerQuery(nextCustomer.name);
    setShowLookup(false);
  }

  function useNewCustomer() {
    setSelected("");
    setCustomerQuery("");
    setShowLookup(false);
  }
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
        treatmentName: String(f.get("treatmentName") || "").trim() || "Customer record",
        durationMinutes: 5,
        staffId: "manual",
        practitionerName: "Historical record",
        customerName: f.get("customerName"),
        customerPhone: f.get("customerPhone"),
        customerEmail: f.get("customerEmail"),
        customerAddress: f.get("customerAddress"),
        customerGender: f.get("customerGender"),
        marketingConsent: f.get("marketingConsent") === "on",
        startsAt: new Date().toISOString(),
        notes: `Session: ${f.get("sessionNumber") || ""} of ${f.get("totalSessions") || ""}\n\nConsultation:\n${consultation || "Not recorded"}\n\nOutcome:\n${outcome || "Not recorded"}`,
        historicalRecord: true,
        suppressNotification: true,
        images,
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
    setCustomerQuery("");
    setImages([]);
    router.refresh();
  }
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSelected(initialCustomerId);
          setCustomerQuery(initialCustomer?.name || "");
          setShowLookup(false);
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
              <div className="grid gap-2 text-xs font-bold sm:col-span-2">
                <label htmlFor="customerLookup">Find an existing customer</label>
                <span className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
                    <Search size={16} />
                  </span>
                  <input
                    id="customerLookup"
                    value={customerQuery}
                    onFocus={() => setShowLookup(true)}
                    onChange={(event) => {
                      setCustomerQuery(event.target.value);
                      setShowLookup(true);
                    }}
                    placeholder="Search by name, phone or email"
                    autoComplete="off"
                    className={`${cls} pl-11`}
                  />
                  {customerQuery && (
                    <button
                      type="button"
                      onClick={useNewCustomer}
                      aria-label="Clear customer search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-black/35 hover:bg-white hover:text-pink"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {showLookup && normalizedQuery && (
                    <span className="absolute z-20 mt-2 block max-h-72 w-full overflow-y-auto rounded-xl border border-black/10 bg-white p-2 shadow-luxe">
                      {matchingCustomers.length ? (
                        matchingCustomers.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectCustomer(item)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-pink-light/40"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-light text-pink">
                              <UserRound size={14} />
                            </span>
                            <span className="min-w-0">
                              <strong className="block truncate text-sm">{item.name}</strong>
                              <small className="block truncate font-medium text-black/45">
                                {[item.phone, item.email].filter(Boolean).join(" · ")}
                              </small>
                            </span>
                          </button>
                        ))
                      ) : (
                        <span className="block px-3 py-4 text-xs font-medium text-black/45">
                          No matching customer. Continue below to create a new customer.
                        </span>
                      )}
                    </span>
                  )}
                </span>
                {customer && (
                  <span className="flex items-center justify-between rounded-xl bg-pink-light/35 px-4 py-3 text-xs">
                    <span><strong className="block">Selected: {customer.name}</strong>{customer.phone}</span>
                    <button type="button" onClick={useNewCustomer} className="font-bold text-pink">Use a new customer</button>
                  </span>
                )}
              </div>
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
              <Field label="Gender">
                <select
                  key={`gender-${selected}`}
                  name="customerGender"
                  defaultValue={customer?.gender || ""}
                  className={cls}
                >
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Customer address" wide>
                <AddressLookup
                  key={`address-${selected}`}
                  name="customerAddress"
                  defaultValue={customer?.address || ""}
                />
              </Field>
              <Field label="Treatment" wide>
                <SearchableOptionInput
                  name="treatmentName"
                  options={treatmentNames}
                  placeholder="Optional — search or enter a treatment"
                  className={cls}
                />
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
                  name="consultation"
                  rows={5}
                  className={cls}
                />
              </Field>
              <Field label="Outcome" wide>
                <textarea name="outcome" rows={4} className={cls} />
              </Field>
              <TreatmentImages images={images} onChange={setImages} />
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
