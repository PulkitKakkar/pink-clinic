"use client";

import { Check, CreditCard, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import type { BranchPaymentConfig } from "@/lib/payments/providers";
import { AppointmentCalendar, type AppointmentDetails } from "@/components/checkout/appointment-calendar";

type PaymentItem = { label: string; detail?: string; amount: number };

export function TestPaymentPage({
  payment,
  items,
  total,
  onBack,
  appointment,
  appointments,
  onPaid,
}: {
  payment: BranchPaymentConfig;
  items: PaymentItem[];
  total: number;
  onBack: () => void;
  appointment?: Omit<AppointmentDetails, "paymentReference">;
  appointments?: Omit<AppointmentDetails, "paymentReference">[];
  onPaid?: (reference: string) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [postcode, setPostcode] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [status, setStatus] = useState<"ready" | "processing" | "declined" | "paid">("ready");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [appointmentIndex, setAppointmentIndex] = useState(0);

  const digits = cardNumber.replace(/\D/g, "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const [month, shortYear] = expiry.split("/").map(Number);
    const now = new Date();
    const expiryEnd = new Date(2000 + shortYear, month);
    if (!month || !shortYear || expiryEnd <= now) {
      setError("Enter a future expiry date.");
      return;
    }
    if (!["4242424242424242", "4000000000000002"].includes(digits)) {
      setError("Use one of the test card numbers shown above.");
      return;
    }
    setStatus("processing");
    window.setTimeout(() => {
      if (digits === "4000000000000002") {
        setStatus("declined");
        return;
      }
      const nextReference = `TEST-${Date.now().toString(36).toUpperCase()}`;
      setReference(nextReference);
      onPaid?.(nextReference);
      setStatus("paid");
    }, 900);
  }

  if (status === "paid") {
    const bookingSteps = appointments || (appointment ? [appointment] : []);
    const bookingStep = bookingSteps[appointmentIndex];
    if (bookingStep)
      return <section className="mx-auto max-w-2xl px-5 py-12 sm:py-20">{bookingSteps.length > 1 && <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[.2em] text-pink">Appointment {appointmentIndex + 1} of {bookingSteps.length}</p>}<AppointmentCalendar key={`${bookingStep.serviceId}-${appointmentIndex}`} details={{ ...bookingStep, paymentReference: reference }} onContinue={appointmentIndex < bookingSteps.length - 1 ? () => setAppointmentIndex((index) => index + 1) : undefined} /></section>;
    return (
      <section className="mx-auto max-w-xl px-5 py-12 sm:py-20">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-luxe">
          <div className="h-2 bg-emerald-500" />
          <div className="p-6 text-center sm:p-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={30} strokeWidth={2.5} /></span>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.25em] text-emerald-700">Test payment approved</p>
            <h1 className="mt-2 font-display text-5xl">Payment complete.</h1>
            <p className="mt-3 text-sm leading-6 text-black/60">This is a test receipt. No money moved and no card details were sent or stored.</p>
            <div className="mt-7 rounded-2xl bg-cream p-5 text-left">
              {items.map((item) => <div key={`${item.label}-${item.detail || ""}`} className="flex justify-between gap-4 border-b border-black/5 py-2 text-xs"><span><strong className="block">{item.label}</strong>{item.detail && <span className="mt-1 block text-black/60">{item.detail}</span>}</span><span className="font-bold">£{item.amount.toFixed(2)}</span></div>)}
              <div className="mt-3 flex justify-between text-lg font-bold"><span>Total paid</span><span>£{total.toFixed(2)}</span></div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-black/10 p-4 text-left text-xs">
              <div><dt className="text-black/60">Reference</dt><dd className="mt-1 font-bold">{reference}</dd></div>
              <div><dt className="text-black/60">Card</dt><dd className="mt-1 font-bold">•••• {digits.slice(-4)}</dd></div>
              <div><dt className="text-black/60">Provider</dt><dd className="mt-1 font-bold">{payment.providerName} test mode</dd></div>
              <div><dt className="text-black/60">Status</dt><dd className="mt-1 font-bold text-emerald-700">Approved</dd></div>
            </dl>
            <button type="button" onClick={onBack} className="button-primary mt-7 w-full"><RotateCcw size={15} /> Run another test</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-12 sm:py-20">
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-luxe">
        <div className={`h-2 ${payment.provider === "lopay" ? "bg-[#6657ff]" : "bg-[#00a98f]"}`} />
        <div className="p-6 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-pink">Secure checkout · Test mode</p><h1 className="mt-2 font-display text-4xl">Pay £{total.toFixed(2)}</h1><p className="mt-1 text-xs font-bold text-black/60">{payment.businessName}</p></div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-light text-pink"><Lock size={20} /></span>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <strong className="block">Use a test card only</strong>
            Success: <button type="button" onClick={() => setCardNumber("4242 4242 4242 4242")} className="font-bold underline">4242 4242 4242 4242</button> · Decline: <button type="button" onClick={() => setCardNumber("4000 0000 0000 0002")} className="font-bold underline">4000 0000 0000 0002</button><br />Use any future expiry, any 3-digit CVC and any postcode.
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-xs font-bold">Card number<div className="relative"><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50" size={18} /><input aria-label="Card number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" pattern="(?:\d{4} ){3}\d{4}" required className="min-h-12 w-full rounded-xl border border-black/15 bg-cream pl-12 pr-4 text-base outline-none focus:border-pink" /></div></label>
            <label className="grid gap-2 text-xs font-bold">Name on card<input value={cardholder} onChange={(event) => setCardholder(event.target.value)} autoComplete="cc-name" required placeholder="Cardholder name" className="min-h-12 rounded-xl border border-black/15 bg-cream px-4 text-base outline-none focus:border-pink" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-xs font-bold">Expiry<input aria-label="Expiry" value={expiry} onChange={(event) => setExpiry(event.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2"))} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])/\d{2}" required className="min-h-12 min-w-0 rounded-xl border border-black/15 bg-cream px-4 text-base outline-none focus:border-pink" /></label>
              <label className="grid gap-2 text-xs font-bold">CVC<input aria-label="CVC" value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" autoComplete="cc-csc" placeholder="123" pattern="\d{3}" required className="min-h-12 min-w-0 rounded-xl border border-black/15 bg-cream px-4 text-base outline-none focus:border-pink" /></label>
            </div>
            <label className="grid gap-2 text-xs font-bold">Billing postcode<input value={postcode} onChange={(event) => setPostcode(event.target.value.toUpperCase())} autoComplete="postal-code" required placeholder="RG1 1TT" className="min-h-12 rounded-xl border border-black/15 bg-cream px-4 text-base uppercase outline-none focus:border-pink" /></label>
            {(status === "declined" || error) && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error || "Your test card was declined. Try the success card number to continue."}</div>}
            <button type="submit" disabled={status === "processing"} className="button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-70">{status === "processing" ? "Processing test payment…" : <><Lock size={15} /> Pay £{total.toFixed(2)}</>}</button>
          </form>
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-black/60"><ShieldCheck size={13} className="text-emerald-600" /> Encrypted-style test UI · no card data leaves this page</div>
          <button type="button" onClick={onBack} className="mt-5 min-h-11 w-full text-xs font-bold text-pink underline underline-offset-4">Return to Pink Beauty checkout</button>
        </div>
      </div>
    </section>
  );
}
