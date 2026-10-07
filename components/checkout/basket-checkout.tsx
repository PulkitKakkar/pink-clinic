"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";
import { CheckoutAgreements } from "@/components/checkout/checkout-agreements";
import { checkoutTotals, requiresProductDelivery } from "@/lib/payments/catalog-checkout";

export function BasketCheckout({ branch, catalog }: { branch: Branch; catalog: Pick<CatalogItem, "handle" | "title" | "kind" | "variants">[] }) {
  const { items } = useBasket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const branchItems = items.filter((item) => item.branchId === branch.id).map((item) => {
    const current = catalog.find((entry) => entry.handle === item.handle);
    const variant = current?.variants.find((entry) => entry.name === item.variantName);
    return { ...item, title: current?.title || item.title, kind: current?.kind || item.kind, unitPrice: variant?.price ?? item.unitPrice };
  });
  const totals = checkoutTotals(branchItems.map((item) => ({ ...item, kind: item.kind || "service", unitAmount: Math.round(item.unitPrice * 100), serviceId: `catalog:${item.handle}`, requiresShipping: requiresProductDelivery(item.kind, item.handle), durationMinutes: 60 })));

  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchSlug: branch.slug, acceptTerms: new FormData(event.currentTarget).get("acceptTerms") === "on", items: branchItems.map(({ handle, variantName, quantity }) => ({ handle, variantName, quantity })) }) });
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error || "Unable to start checkout.");
      window.location.assign(body.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to start checkout."); setLoading(false); }
  }

  if (!branchItems.length) return <main className="min-h-screen bg-cream pt-28"><div className="container-site py-20 text-center"><h1 className="font-display text-5xl">Your basket is empty.</h1><Link href="/basket" className="button-primary mt-6">Return to basket</Link></div></main>;

  return <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24"><section className="container-site grid gap-8 py-10 sm:py-16 lg:grid-cols-[1fr_420px] lg:gap-12">
    <form id="basket-checkout" onSubmit={checkout}>
      <Link href="/basket" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> Back to basket</Link>
      <p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p>
      <h1 className="mt-3 font-display text-5xl sm:text-7xl">Complete your payment.</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-black/60">Review your order, then continue to Stripe to enter your contact and payment details. After payment, you can choose an appointment for each treatment purchased.</p>
      {branchItems.some((item) => requiresProductDelivery(item.kind, item.handle)) && <p className="mt-4 text-sm leading-6 text-black/60">Products are delivered within the UK by Royal Mail 48. Delivery is £4.99, or free when your product subtotal is £75 or more. Stripe will collect your delivery address.</p>}
      <div className="mt-6 flex gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/60"><ShieldCheck className="shrink-0 text-pink" size={18} />Your card details are handled securely by Stripe.</div>
      <CheckoutAgreements />
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </form>
    <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p>
      <div className="mt-5 flex gap-3 border-b border-white/10 pb-5"><MapPin className="shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs text-white/70">{branch.address}</p></div></div>
      <div className="divide-y divide-white/10">{branchItems.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-xs"><div><p className="font-bold">{item.quantity} × {item.title}</p><p className="mt-1 text-white/70">{item.variantName}</p></div><span>£{(item.unitPrice * item.quantity).toFixed(2)}</span></div>)}</div>
      {branchItems.some((item) => requiresProductDelivery(item.kind, item.handle)) && <div className="flex justify-between py-4 text-xs"><span>Delivery</span><span>{totals.shippingAmount ? `£${(totals.shippingAmount / 100).toFixed(2)}` : "Free"}</span></div>}
      <div className="flex justify-between border-t border-white/10 py-6"><span className="text-white/70">Total</span><span className="text-3xl font-bold">£{(totals.amountTotal / 100).toFixed(2)}</span></div>
      <button type="submit" form="basket-checkout" disabled={loading} className="button-primary w-full disabled:opacity-50"><CreditCard size={16} /> {loading ? "Opening Stripe…" : "Continue to Stripe"}</button>
      <p className="mt-4 text-center text-[10px] text-white/70">Final prices are confirmed in Stripe before payment.</p>
    </aside>
  </section></main>;
}
