"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CheckoutAgreements } from "@/components/checkout/checkout-agreements";
import { AppointmentCalendar } from "@/components/checkout/appointment-calendar";

export function StripeTreatmentCheckout({ branch, service, price }: { branch: { id: string; name: string; address: string; slug: string }; service: { id: string; title: string; duration?: string; slug: string }; price: number }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [error, setError] = useState("");
  const durationMinutes = service.id === "laser-hair-removal" ? 60 : Number(service.duration?.match(/\d+/)?.[0]) || 60;

  async function startCheckout(startsAt: string) {
    setStartingCheckout(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchSlug: branch.slug, serviceSlug: service.slug, startsAt, acceptTerms: true }) });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || "Unable to start checkout.");
      window.location.assign(body.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to start checkout."); setStartingCheckout(false); }
  }

  if (showCalendar) return <main className="mx-auto max-w-2xl px-5 py-12 sm:py-20"><AppointmentCalendar details={{ branchId: branch.id, branchName: branch.name, branchAddress: branch.address, serviceId: service.id, treatmentName: service.title, durationMinutes, customer: { firstName: "", lastName: "", email: "", phone: "", address: "", postcode: "" }, paymentReference: "" }} onSelected={startCheckout} loadingSelection={startingCheckout} />{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}</main>;

  return <section className="container-site grid gap-7 py-10 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
    <form onSubmit={(event) => { event.preventDefault(); setShowCalendar(true); }} id="treatment-checkout"><Link href={`/treatments/${branch.slug}/${service.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> Back to treatment</Link><p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p><h1 className="mt-3 font-display text-5xl leading-none tracking-[-.04em] sm:text-7xl">Choose your appointment.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-black/55">Choose an available time first, then pay securely with Stripe. Your appointment is confirmed only after Stripe verifies payment.</p><div className="mt-7 flex items-start gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/50"><ShieldCheck className="mt-0.5 shrink-0 text-pink" size={18} /><p>Card details are collected securely by Stripe. Pink receives the contact details needed for your booking.</p></div><CheckoutAgreements /></form>
    <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p><h2 className="mt-6 font-display text-4xl">{service.title}</h2>{service.duration && <p className="mt-2 text-xs text-white/50">{service.duration}</p>}<div className="mt-6 flex items-start gap-3 border-y border-white/10 py-5"><MapPin className="mt-0.5 shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs leading-5 text-white/45">{branch.address}</p></div></div><div className="flex items-center justify-between py-6"><span className="text-sm text-white/55">Total</span><span className="text-3xl font-bold">£{price.toFixed(2)}</span></div><button type="submit" form="treatment-checkout" className="button-primary w-full"><CreditCard size={16} /> Choose time & continue to Stripe</button></aside>
  </section>;
}
