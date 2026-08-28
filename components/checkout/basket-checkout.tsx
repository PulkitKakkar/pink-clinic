"use client";

import Link from "next/link";
import { ArrowLeft, Check, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
import type { BasketItem } from "@/lib/basket/types";
import type { Branch } from "@/lib/branches";
import type { BranchPaymentConfig } from "@/lib/payments/providers";
import type { CustomerDetails } from "@/components/checkout/appointment-calendar";
import { getBookableBasketItems, type BasketCatalogMetadata } from "@/lib/basket/checkout";
import { CheckoutAgreements } from "@/components/checkout/checkout-agreements";
import { TestPaymentPage } from "@/components/checkout/test-payment-page";

export function BasketCheckout({
  branch,
  payment,
  catalogItems,
}: {
  branch: Branch;
  payment: BranchPaymentConfig;
  catalogItems: BasketCatalogMetadata[];
}) {
  const { items, clearBasket } = useBasket();
  const [showProvider, setShowProvider] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<BasketItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const branchItems = items.filter((item) => item.branchId === branch.id);
  const checkoutItems = showProvider ? purchasedItems : branchItems;
  const total = checkoutItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const appointments = customer
    ? getBookableBasketItems(checkoutItems, catalogItems).map(({ item, durationMinutes }) => ({
          branchId: branch.id,
          branchName: branch.name,
          branchAddress: branch.address,
          serviceId: `catalog:${item.handle}`,
          treatmentName: item.title,
          durationMinutes,
          customer,
        }))
    : [];

  if (!checkoutItems.length)
    return (
      <main className="min-h-screen bg-cream pt-28">
        <div className="container-site py-20 text-center">
          <h1 className="font-display text-5xl">Your basket is empty.</h1>
          <Link href="/basket" className="button-primary mt-6">Return to basket</Link>
        </div>
      </main>
    );

  if (showProvider)
    return (
      <main className="min-h-screen bg-pink-light/30 pt-24">
        <TestPaymentPage
          payment={payment}
          items={checkoutItems.map((item) => ({
            label: `${item.quantity} × ${item.title}`,
            detail: item.variantName,
            amount: item.unitPrice * item.quantity,
          }))}
          total={total}
          appointments={appointments}
          onPaid={clearBasket}
          onBack={() => setShowProvider(false)}
        />
      </main>
    );

  return (
    <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24">
      <section className="container-site grid gap-8 py-10 sm:py-16 lg:grid-cols-[1fr_420px] lg:gap-12">
        <form
          id="basket-customer-details"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setCustomer({
              firstName: String(form.get("firstName") || ""),
              lastName: String(form.get("lastName") || ""),
              email: String(form.get("email") || ""),
              phone: String(form.get("phone") || ""),
              address: String(form.get("address") || ""),
              postcode: String(form.get("postcode") || ""),
            });
            setPurchasedItems(branchItems);
            setShowProvider(true);
          }}
        >
          <Link href="/basket" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={15} /> Back to basket</Link>
          <p className="mt-9 text-[10px] font-bold uppercase tracking-[.3em] text-pink">Pink Beauty secure checkout</p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl">Complete your payment.</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold">First name<input name="firstName" autoComplete="given-name" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" /></label>
            <label className="grid gap-2 text-xs font-bold">Last name<input name="lastName" autoComplete="family-name" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" /></label>
            <label className="grid gap-2 text-xs font-bold sm:col-span-2">Email address<input name="email" type="email" autoComplete="email" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" /></label>
            <label className="grid gap-2 text-xs font-bold sm:col-span-2">Phone number<input name="phone" type="tel" autoComplete="tel" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" /></label>
            <label className="grid gap-2 text-xs font-bold sm:col-span-2">Address<textarea name="address" autoComplete="street-address" required rows={2} className="rounded-xl border border-black/10 bg-white px-4 py-3.5 outline-none focus:border-pink" /></label>
            <label className="grid gap-2 text-xs font-bold">Postcode<input name="postcode" autoComplete="postal-code" required className="rounded-xl border border-black/10 bg-white px-4 py-3.5 uppercase outline-none focus:border-pink" /></label>
          </div>
          <div className="mt-6 flex gap-3 rounded-2xl bg-white p-4 text-xs leading-5 text-black/50"><ShieldCheck className="shrink-0 text-pink" size={18} />Card details will be handled by {payment.providerName}, not stored by Pink Beauty.</div>
          <CheckoutAgreements />
        </form>
        <aside className="h-fit rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Order summary</p>
          <div className="mt-5 flex gap-3 border-b border-white/10 pb-5"><MapPin className="shrink-0 text-pink-light" size={17} /><div><p className="text-sm font-bold">{branch.name}</p><p className="mt-1 text-xs text-white/45">{branch.address}</p></div></div>
          <div className="divide-y divide-white/10">{branchItems.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-xs"><div><p className="font-bold">{item.quantity} × {item.title}</p><p className="mt-1 text-white/40">{item.variantName}</p></div><span>£{(item.unitPrice * item.quantity).toFixed(2)}</span></div>)}</div>
          <div className="flex justify-between border-t border-white/10 py-6"><span className="text-white/55">Total</span><span className="text-3xl font-bold">£{total.toFixed(2)}</span></div>
          <button type="submit" form="basket-customer-details" className="button-primary w-full"><CreditCard size={16} /> Continue with {payment.providerName}</button>
          <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/40"><Check size={12} /> {payment.checkoutDescription}</p>
        </aside>
      </section>
    </main>
  );
}
