"use client";

import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Lock, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { BranchPaymentConfig } from "@/lib/payments/providers";

type Props = {
  branch: { name: string; address: string; slug: string };
  service: { title: string; duration?: string; slug: string };
  price: number;
  payment: BranchPaymentConfig;
  variants?: { name: string; price: number }[];
  returnHref?: string;
  returnLabel?: string;
};

export function PaymentCheckoutMockup({ branch, service, price, payment, variants = [], returnHref, returnLabel = "Back to treatment" }: Props) {
  const [showProvider, setShowProvider] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const chosenVariant = variants[selectedVariant];
  const total = chosenVariant?.price ?? price;

  if (showProvider) {
    return (
      <section className="mx-auto max-w-xl px-5 py-12 sm:py-20">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-soft">
          <div className={`h-2 ${payment.provider === "lopay" ? "bg-[#6657ff]" : "bg-[#00a98f]"}`} />
          <div className="p-6 text-center sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-pink-light text-pink"><Lock size={23} /></span>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.25em] text-black/40">Provider preview</p>
            <h1 className="mt-2 font-display text-5xl">{payment.providerName}</h1>
            <p className="mt-2 text-sm font-bold">{payment.businessName}</p>
            <div className="mt-7 rounded-2xl bg-cream p-5 text-left">
              <div className="flex justify-between gap-4 text-sm"><span className="text-black/50">Payment for</span><span className="text-right font-bold">{service.title}</span></div>
              {chosenVariant && <div className="mt-3 flex justify-between gap-4 border-t border-black/5 pt-3 text-sm"><span className="text-black/50">Option</span><span className="font-bold">{chosenVariant.name}</span></div>}
              <div className="mt-3 flex justify-between gap-4 border-t border-black/5 pt-3"><span className="text-sm text-black/50">Total</span><span className="text-xl font-bold">£{total.toFixed(2)}</span></div>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-black/15 p-6 text-sm leading-6 text-black/45">
              The real {payment.providerName} secure card form will appear here. This mock-up never asks for or stores card details.
            </div>
            <button type="button" disabled className="mt-6 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-black/15 px-6 text-sm font-bold text-white"><Lock size={15} /> Pay £{total.toFixed(2)} · Demo only</button>
            <button type="button" onClick={() => setShowProvider(false)} className="mt-5 text-xs font-bold text-pink underline underline-offset-4">Return to Pink Beauty checkout</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-site grid gap-7 py-10 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
      <div>
        <Link href={returnHref || `/treatments/${branch.slug}/${service.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> {returnLabel}</Link>
        <p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-[-.04em] sm:text-7xl">Complete your payment.</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">Review your branch and treatment before continuing to the secure payment step.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-bold">First name<input className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="Your first name" /></label>
          <label className="grid gap-2 text-xs font-bold">Last name<input className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="Your last name" /></label>
          <label className="grid gap-2 text-xs font-bold sm:col-span-2">Email address<input type="email" className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" placeholder="you@example.com" /></label>
        </div>
        {variants.length > 1 && <fieldset className="mt-6"><legend className="text-xs font-bold">Choose an option</legend><div className="mt-3 flex flex-wrap gap-2">{variants.map((variant, index) => <button key={variant.name} type="button" onClick={() => setSelectedVariant(index)} aria-pressed={selectedVariant === index} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${selectedVariant === index ? "border-pink bg-pink text-white" : "border-black/10 bg-white hover:border-pink hover:text-pink"}`}>{variant.name} · £{variant.price.toFixed(2)}</button>)}</div></fieldset>}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/50"><ShieldCheck className="mt-0.5 shrink-0 text-pink" size={18} /><p>Your card details will be entered with {payment.providerName}, not stored by Pink Beauty. This page is a visual demonstration only.</p></div>
      </div>

      <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8 lg:sticky lg:top-28">
        <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p><span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider">Mock-up</span></div>
        <h2 className="mt-6 font-display text-4xl">{service.title}</h2>
        {(chosenVariant || service.duration) && <p className="mt-2 text-xs text-white/50">{chosenVariant?.name || service.duration}</p>}
        <div className="mt-6 flex items-start gap-3 border-y border-white/10 py-5"><MapPin className="mt-0.5 shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs leading-5 text-white/45">{branch.address}</p></div></div>
        <div className="flex items-center justify-between py-6"><span className="text-sm text-white/55">Total</span><span className="text-3xl font-bold">£{total.toFixed(2)}</span></div>
        <button type="button" onClick={() => setShowProvider(true)} className="button-primary w-full"><CreditCard size={16} /> Continue securely with {payment.providerName}</button>
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/40"><Lock size={12} /> {payment.checkoutDescription}</div>
        <div className="mt-6 grid gap-2 border-t border-white/10 pt-5 text-[10px] text-white/45">
          <p className="flex items-center gap-2"><Check size={12} className="text-pink-light" /> Provider selected automatically from your branch</p>
          <p className="flex items-center gap-2"><Check size={12} className="text-pink-light" /> Payment goes to the correct branch account</p>
        </div>
      </aside>
    </section>
  );
}
