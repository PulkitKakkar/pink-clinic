"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";
import { requiresProductDelivery } from "@/lib/payments/catalog-checkout";
import { CheckoutAgreements } from "@/components/checkout/checkout-agreements";

export function CatalogCheckout({ branch, item, returnHref }: { branch: Branch; item: CatalogItem; returnHref: string }) {
  const variants = item.variants.filter((variant) => variant.available !== false && Number.isFinite(variant.price) && variant.price > 0);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const variant = variants[selected];
  const delivery = requiresProductDelivery(item.kind, item.handle);
  const shipping = delivery && variant.price < 75 ? 4.99 : 0;
  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchSlug: branch.slug, acceptTerms: new FormData(event.currentTarget).get("acceptTerms") === "on", items: [{ handle: item.handle, variantName: variant.name, quantity: 1 }], catalogHandle: item.handle }) });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || "Unable to start checkout.");
      window.location.assign(body.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to start checkout."); setLoading(false); }
  }
  return <section className="container-site grid gap-7 py-10 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
    <form id="catalog-checkout" onSubmit={checkout}>
      <Link href={returnHref} className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> Back to products & services</Link>
      <p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-[-.04em] sm:text-7xl">Complete your payment.</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-black/60">Review your order, then enter your contact and payment details securely with Stripe.{item.kind === "service" ? " After payment, choose an available appointment time." : item.kind === "course" ? " Pink will contact you to arrange your course." : delivery ? " Products are delivered within the UK by Royal Mail 48. Stripe will collect your delivery address." : " Pink will contact you with your gift card details."}</p>
      {variants.length > 1 && <fieldset className="mt-6"><legend className="text-xs font-bold">Choose an option</legend><div className="mt-3 flex flex-wrap gap-2">{variants.map((entry, index) => <button key={entry.name} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${selected === index ? "border-pink bg-pink text-white" : "border-black/10 bg-white hover:border-pink hover:text-pink"}`}>{entry.name} · £{entry.price.toFixed(2)}</button>)}</div></fieldset>}
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/60"><ShieldCheck className="mt-0.5 shrink-0 text-pink" size={18} /><p>Your card details are handled securely by Stripe.</p></div>
      <CheckoutAgreements />
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </form>
    <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8 lg:sticky lg:top-28">
      <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p>
      <h2 className="mt-6 font-display text-4xl">{item.title}</h2><p className="mt-2 text-xs text-white/70">{variant.name}</p>
      <div className="mt-6 flex items-start gap-3 border-y border-white/10 py-5"><MapPin className="mt-0.5 shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs leading-5 text-white/70">{branch.address}</p></div></div>
      {delivery && <div className="mt-5 flex justify-between text-xs"><span>Delivery</span><span>{shipping ? `£${shipping.toFixed(2)}` : "Free"}</span></div>}
      <div className="flex items-center justify-between py-6"><span className="text-sm text-white/70">Total</span><span className="text-3xl font-bold">£{(variant.price + shipping).toFixed(2)}</span></div>
      <button type="submit" form="catalog-checkout" disabled={loading} className="button-primary w-full disabled:opacity-50"><CreditCard size={16} /> {loading ? "Opening Stripe…" : "Continue to Stripe"}</button>
    </aside>
  </section>;
}
