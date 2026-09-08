"use client";
import { useState } from "react";
import { LoaderCircle, Plus, Search, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerHistory } from "@/lib/admin/customer-history";
import { AddressLookup } from "@/components/admin/address-lookup";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { SearchableOptionInput } from "@/components/admin/searchable-option-input";
import { LaserAreaSettings } from "@/components/admin/laser-area-settings";
import { formatLaserSettings, type LaserAreaSetting } from "@/lib/admin/laser-settings";
const cls =
  "w-full rounded-xl border border-black/10 bg-cream px-4 py-3 text-sm outline-none focus:border-pink";
const blankLaserArea = (): LaserAreaSetting => ({ area: "", fluence: "", hertz: "", shotsFired: "", pulse: "Auto by machine" });
const laserAreasByTreatment: Array<[RegExp, string]> = [
  [/upper\s*lip/i, "Upper lip"], [/underarm/i, "Underarms"], [/hands?|fingers?/i, "Hands / fingers"],
  [/feet|toes/i, "Feet / toes"], [/bikini/i, "Bikini line"], [/brazilian/i, "Brazilian"],
  [/hollywood/i, "Hollywood"], [/jawline/i, "Jawline"], [/buttocks?|bum/i, "Buttocks"],
  [/abdomen|stomach|tummy/i, "Abdomen"], [/chest/i, "Chest"], [/back/i, "Back"],
  [/arms?/i, "Arms"], [/legs?/i, "Legs"], [/neck/i, "Neck"], [/chin/i, "Chin"], [/face|facial/i, "Face"],
];

function suggestedLaserAreas(treatmentName: string) {
  if (!/laser/i.test(treatmentName)) return [];
  if (/full\s*body/i.test(treatmentName)) return [blankLaserArea(), blankLaserArea()];
  const area = laserAreasByTreatment.find(([pattern]) => pattern.test(treatmentName))?.[1];
  return area ? [{ ...blankLaserArea(), area }] : [];
}

function courseProgress(customer: CustomerHistory | undefined, treatmentName: string) {
  if (!customer || !treatmentName.trim()) return undefined;
  const sessions = customer.bookings
    .filter((booking) => booking.treatmentName.trim().toLowerCase() === treatmentName.trim().toLowerCase())
    .map((booking) => ({ booking, match: booking.notes.match(/^Session:\s*(\d+)\s*of\s*(\d+)/i) }))
    .filter((item): item is { booking: CustomerHistory["bookings"][number]; match: RegExpMatchArray } => Boolean(item.match))
    .map(({ booking, match }) => ({
      current: Number(match[1]),
      total: Number(match[2]),
      coursePrice: booking.notes.match(/Course price:\s*£?([\d.]+)/i)?.[1] || "",
      payment: booking.notes.match(/Payment received this visit:\s*£?([\d.]+)/i)?.[1] || booking.notes.match(/Amount paid:\s*£?([\d.]+)/i)?.[1] || "",
      payAsYouGo: /Payment type:\s*Pay as you go/i.test(booking.notes),
    }));
  if (!sessions.length) return undefined;
  return {
    nextSession: Math.max(...sessions.map((session) => session.current)) + 1,
    totalSessions: Math.max(...sessions.map((session) => session.total)),
    coursePrice: sessions.find((session) => session.coursePrice)?.coursePrice || "",
    totalPaid: sessions.reduce((sum, session) => sum + (Number(session.payment) || 0), 0),
    payAsYouGo: sessions.some((session) => session.payAsYouGo),
  };
}

export function AddCustomerHistory({
  customers,
  initialCustomerId = "",
  label = "Add customer record",
  treatmentNames,
  catalogueCourseFees = [],
}: {
  customers: CustomerHistory[];
  initialCustomerId?: string;
  label?: string;
  treatmentNames: string[];
  catalogueCourseFees?: Array<{ treatmentName: string; label: string; price: number }>;
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
  const [treatmentName, setTreatmentName] = useState("");
  const [laserAreas, setLaserAreas] = useState<LaserAreaSetting[]>([]);
  const [payAsYouGo, setPayAsYouGo] = useState(false);
  const [coursePrice, setCoursePrice] = useState("");
  const [catalogueCourseFee, setCatalogueCourseFee] = useState("");
  const [amount, setAmount] = useState("");
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
  const isLaserTreatment = /laser/i.test(treatmentName);
  const previousCourse = courseProgress(customer, treatmentName);
  const matchingCatalogueCourseFees = catalogueCourseFees.filter(
    (fee) => fee.treatmentName.trim().toLowerCase() === treatmentName.trim().toLowerCase(),
  );
  const activePayAsYouGo = payAsYouGo || Boolean(previousCourse?.payAsYouGo);
  const sessionNumber = previousCourse?.nextSession || (activePayAsYouGo ? 1 : "");
  const totalSessions = activePayAsYouGo ? sessionNumber : previousCourse?.totalSessions || "";
  const activeCoursePrice = previousCourse?.coursePrice || coursePrice;
  const remainingBalance = activePayAsYouGo || !activeCoursePrice
    ? undefined
    : Math.max(0, Number(activeCoursePrice) - (previousCourse?.totalPaid || 0) - (Number(amount) || 0));

  function selectCustomer(nextCustomer: CustomerHistory) {
    setSelected(nextCustomer.id);
    setCustomerQuery(nextCustomer.name);
    setShowLookup(false);
    setPayAsYouGo(Boolean(courseProgress(nextCustomer, treatmentName)?.payAsYouGo));
    setCoursePrice("");
    setCatalogueCourseFee("");
    setAmount("");
  }

  function useNewCustomer() {
    setSelected("");
    setCustomerQuery("");
    setShowLookup(false);
    setPayAsYouGo(false);
    setCoursePrice("");
    setCatalogueCourseFee("");
    setAmount("");
  }

  function changeTreatment(nextTreatment: string) {
    setTreatmentName(nextTreatment);
    setLaserAreas(suggestedLaserAreas(nextTreatment));
    setPayAsYouGo(Boolean(courseProgress(customer, nextTreatment)?.payAsYouGo));
    setCoursePrice("");
    setCatalogueCourseFee("");
    setAmount("");
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const consultation = String(f.get("consultation") || "").trim();
    const outcome = String(f.get("outcome") || "").trim();
    const amountPaid = String(f.get("amount") || "").trim();
    const coursePriceValue = String(f.get("coursePrice") || "").trim();
    const newRemainingBalance = coursePriceValue
      ? Math.max(0, Number(coursePriceValue) - (previousCourse?.totalPaid || 0) - (Number(amountPaid) || 0))
      : undefined;
    const laserSettings = isLaserTreatment ? formatLaserSettings(laserAreas) : "";
    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId: "reading-west-street",
        serviceId: "manual",
        treatmentName: treatmentName.trim() || "Customer record",
        durationMinutes: 5,
        staffId: "manual",
        practitionerName: "Historical record",
        customerFirstName: f.get("customerFirstName"),
        customerLastName: f.get("customerLastName"),
        customerPhone: f.get("customerPhone"),
        customerEmail: f.get("customerEmail"),
        customerAddress: f.get("customerAddress"),
        customerPostcode: f.get("customerPostcode"),
        customerGender: f.get("customerGender"),
        customerOccupation: f.get("customerOccupation"),
        customerDateOfBirth: f.get("customerDateOfBirth"),
        marketingConsent: f.get("marketingConsent") === "on",
        startsAt: new Date().toISOString(),
        notes: `Session: ${f.get("sessionNumber") || ""} of ${f.get("totalSessions") || ""}${f.get("payAsYouGo") === "on" ? "\nPayment type: Pay as you go" : "\nPayment type: Course"}${coursePriceValue ? `\nCourse price: £${Number(coursePriceValue).toFixed(2)}` : ""}${amountPaid ? `\nPayment received this visit: £${Number(amountPaid).toFixed(2)}` : ""}${newRemainingBalance !== undefined ? `\nRemaining balance: £${newRemainingBalance.toFixed(2)}` : ""}\n\nConsultation:\n${consultation || "Not recorded"}\n\nOutcome:\n${outcome || "Not recorded"}${laserSettings}`,
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
    setTreatmentName("");
    setLaserAreas([]);
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
          setTreatmentName("");
          setLaserAreas([]);
          setPayAsYouGo(false);
          setCoursePrice("");
          setCatalogueCourseFee("");
          setAmount("");
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
                <p className="mt-2 text-xs text-black/45">
                  <span className="font-bold text-pink" aria-hidden="true">*</span>{" "}
                  Required fields
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 text-xs font-bold sm:col-span-2">
                <label htmlFor="customerLookup">Find an existing customer</label>
                <span className="relative w-full self-start">
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
              <Field label="First name" required>
                <input
                  key={`first-name-${selected}`}
                  required
                  name="customerFirstName"
                  autoComplete="given-name"
                  defaultValue={customer?.firstName || ""}
                  className={cls}
                />
              </Field>
              <Field label="Last name" required>
                <input key={`last-name-${selected}`} required name="customerLastName" autoComplete="family-name" defaultValue={customer?.lastName || ""} className={cls} />
              </Field>
              <Field label="Customer phone" wide required>
                <input
                  key={`phone-${selected}`}
                  required
                  name="customerPhone"
                  type="tel"
                  defaultValue={customer?.phone || ""}
                  className={cls}
                />
              </Field>
              <Field label="Customer address" wide>
                <AddressLookup
                  key={`address-${selected}`}
                  name="customerAddress"
                  defaultValue={customer?.address || ""}
                />
              </Field>
              <p className="mt-2 border-t border-black/10 pt-5 text-[10px] font-bold uppercase tracking-[.18em] text-black/40 sm:col-span-2">
                Optional details
              </p>
              <Field label="Customer email" wide>
                <input
                  key={`email-${selected}`}
                  name="customerEmail"
                  type="email"
                  defaultValue={customer?.email || ""}
                  className={cls}
                />
              </Field>
              <Field label="Customer postcode">
                <input key={`postcode-${selected}`} name="customerPostcode" autoComplete="postal-code" defaultValue={customer?.postcode || ""} className={`${cls} uppercase`} />
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
              <Field label="Occupation">
                <input
                  key={`occupation-${selected}`}
                  name="customerOccupation"
                  defaultValue={customer?.occupation || ""}
                  className={cls}
                />
              </Field>
              <Field label="Date of birth">
                <input
                  key={`dob-${selected}`}
                  name="customerDateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  defaultValue={customer?.dateOfBirth || ""}
                  className={cls}
                />
              </Field>
              <Field label="Treatment" wide>
                <SearchableOptionInput
                  name="treatmentName"
                  options={treatmentNames}
                  placeholder="Optional — search or enter a treatment"
                  className={cls}
                  value={treatmentName}
                  onChange={changeTreatment}
                />
              </Field>
              <Field label="Session number">
                <input
                  key={`session-${selected}-${treatmentName}-${activePayAsYouGo}`}
                  name="sessionNumber"
                  type="number"
                  min="1"
                  defaultValue={sessionNumber}
                  readOnly={Boolean(previousCourse) || activePayAsYouGo}
                  placeholder="e.g. 1"
                  className={cls}
                />
                {previousCourse && <small className="font-medium text-black/45">Next session in this course: {sessionNumber} of {totalSessions}</small>}
              </Field>
              <Field label="Total sessions booked">
                <input
                  key={`total-sessions-${selected}-${treatmentName}-${activePayAsYouGo}`}
                  name="totalSessions"
                  type="number"
                  min="1"
                  defaultValue={totalSessions}
                  readOnly={Boolean(previousCourse) || activePayAsYouGo}
                  placeholder="e.g. 6"
                  className={cls}
                />
              </Field>
              <label className="flex gap-3 rounded-xl bg-pink-light/35 p-4 text-xs sm:col-span-2">
                <input name="payAsYouGo" type="checkbox" checked={activePayAsYouGo} onChange={(event) => { setPayAsYouGo(event.target.checked); if (event.target.checked) { setCoursePrice(""); setCatalogueCourseFee(""); setAmount(""); } }} className="mt-1 accent-pink" />
                <span><strong className="block">Pay as you go</strong>Record each visit as its own session. The next visit for this treatment will continue as 2 of 2, then 3 of 3.</span>
              </label>
              {!activePayAsYouGo && <Field label="Course price">
                <span className="relative block w-full self-start">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/55">£</span>
                  <input name="coursePrice" type="number" min="0" step="0.01" inputMode="decimal" value={activeCoursePrice} onChange={(event) => setCoursePrice(event.target.value)} readOnly={Boolean(previousCourse?.coursePrice)} placeholder="0.00" className={`${cls} pl-8 ${previousCourse?.coursePrice ? "bg-pink-light/35" : ""}`} />
                </span>
                {matchingCatalogueCourseFees.length > 0 && !previousCourse?.coursePrice && (
                  <select
                    value={catalogueCourseFee}
                    onChange={(event) => {
                      const selectedFee = matchingCatalogueCourseFees.find((fee) => `${fee.label}:${fee.price}` === event.target.value);
                      setCatalogueCourseFee(event.target.value);
                      if (selectedFee) setCoursePrice(String(selectedFee.price));
                    }}
                    className={cls}
                    aria-label="Choose catalogue course fee"
                  >
                    <option value="">Choose a website catalogue fee</option>
                    {matchingCatalogueCourseFees.map((fee) => <option key={`${fee.label}:${fee.price}`} value={`${fee.label}:${fee.price}`}>{fee.label} — £{fee.price.toFixed(2)}</option>)}
                  </select>
                )}
                {matchingCatalogueCourseFees.length > 0 && !previousCourse?.coursePrice && <small className="font-medium text-black/45">Selecting a catalogue fee fills the price above; you can edit it for a discount.</small>}
              </Field>}
              <Field label={activePayAsYouGo ? "Amount paid" : "Payment received this visit"}>
                <span className="relative block w-full self-start">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/55">£</span>
                  <input name="amount" type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className={`${cls} pl-8`} />
                </span>
              </Field>
              {!activePayAsYouGo && activeCoursePrice && <Field label="Remaining balance">
                <output className={`${cls} block bg-pink-light/35 pl-8`} aria-live="polite">£{remainingBalance?.toFixed(2)}</output>
              </Field>}
              {isLaserTreatment && <LaserAreaSettings value={laserAreas} onChange={setLaserAreas} />}
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
  required,
  children,
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`grid gap-2 text-xs font-bold ${wide ? "sm:col-span-2" : ""}`}
    >
      <span>
        {label}
        {required && (
          <span className="ml-1 text-pink" aria-hidden="true">*</span>
        )}
      </span>
      {children}
    </label>
  );
}
