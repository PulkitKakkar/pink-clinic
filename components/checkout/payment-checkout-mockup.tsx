"use client";

import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Lock, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { BranchPaymentConfig } from "@/lib/payments/providers";
import { CheckoutAgreements } from "@/components/checkout/checkout-agreements";
import { TestPaymentPage } from "@/components/checkout/test-payment-page";
import type { CustomerDetails } from "@/components/checkout/appointment-calendar";

type Props = {
  branch: { id: string; name: string; address: string; slug: string };
  service: { id?: string; title: string; duration?: string; slug: string };
  price: number;
  payment: BranchPaymentConfig;
  variants?: { name: string; price: number }[];
  returnHref?: string;
  returnLabel?: string;
};

export function PaymentCheckoutMockup({ branch, service, price, payment, variants = [], returnHref, returnLabel = "Back to treatment" }: Props) {
  const [showProvider, setShowProvider] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const chosenVariant = variants[selectedVariant];
  const total = chosenVariant?.price ?? price;
  const durationMinutes = service.id === "laser-hair-removal" ? 60 : Number(service.duration?.match(/\d+/)?.[0]) || 60;

  if (showProvider) {
    return <TestPaymentPage payment={payment} items={[{ label: service.title, detail: chosenVariant?.name || service.duration, amount: total }]} total={total} onBack={() => setShowProvider(false)} appointment={customer ? { branchId: branch.id, branchName: branch.name, branchAddress: branch.address, serviceId: service.id || `catalog:${service.slug}`, treatmentName: service.title, durationMinutes, customer } : undefined} />;
  }

  return (
    <section className="container-site grid gap-7 py-10 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
      <form id="treatment-customer-details" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setCustomer({ firstName: String(form.get("firstName") || ""), lastName: String(form.get("lastName") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || "") }); setShowProvider(true); }}>
        <Link href={returnHref || `/treatments/${branch.slug}/${service.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> {returnLabel}</Link>
        <p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-[-.04em] sm:text-7xl">Complete your payment.</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">Review your branch and treatment before continuing to the secure payment step.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-bold">First name<input name="firstName" autoComplete="given-name" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="Your first name" /></label>
          <label className="grid gap-2 text-xs font-bold">Last name<input name="lastName" autoComplete="family-name" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="Your last name" /></label>
          <label className="grid gap-2 text-xs font-bold sm:col-span-2">Email address<input name="email" type="email" autoComplete="email" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="you@example.com" /></label>
          <label className="grid gap-2 text-xs font-bold sm:col-span-2">Phone number<input name="phone" type="tel" autoComplete="tel" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="07xxx xxxxxx" /></label>
        </div>
        {variants.length > 1 && <fieldset className="mt-6"><legend className="text-xs font-bold">Choose an option</legend><div className="mt-3 flex flex-wrap gap-2">{variants.map((variant, index) => <button key={variant.name} type="button" onClick={() => setSelectedVariant(index)} aria-pressed={selectedVariant === index} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${selectedVariant === index ? "border-pink bg-pink text-white" : "border-black/10 bg-white hover:border-pink hover:text-pink"}`}>{variant.name} · £{variant.price.toFixed(2)}</button>)}</div></fieldset>}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/50"><ShieldCheck className="mt-0.5 shrink-0 text-pink" size={18} /><p>Your card details will be entered with {payment.providerName}, not stored by Pink Beauty. This page is a visual demonstration only.</p></div>
        <CheckoutAgreements />
      </form>

      <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8 lg:sticky lg:top-28">
        <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p><span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider">Mock-up</span></div>
        <h2 className="mt-6 font-display text-4xl">{service.title}</h2>
        {(chosenVariant || service.duration) && <p className="mt-2 text-xs text-white/50">{chosenVariant?.name || service.duration}</p>}
        <div className="mt-6 flex items-start gap-3 border-y border-white/10 py-5"><MapPin className="mt-0.5 shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs leading-5 text-white/45">{branch.address}</p></div></div>
        <div className="flex items-center justify-between py-6"><span className="text-sm text-white/55">Total</span><span className="text-3xl font-bold">£{total.toFixed(2)}</span></div>
        <button type="submit" form="treatment-customer-details" className="button-primary w-full"><CreditCard size={16} /> Continue securely with {payment.providerName}</button>
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/40"><Lock size={12} /> {payment.checkoutDescription}</div>
        <div className="mt-6 grid gap-2 border-t border-white/10 pt-5 text-[10px] text-white/45">
          <p className="flex items-center gap-2"><Check size={12} className="text-pink-light" /> Provider selected automatically from your branch</p>
          <p className="flex items-center gap-2"><Check size={12} className="text-pink-light" /> Payment goes to the correct branch account</p>
        </div>
      </aside>
    </section>
  );
}
