"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useBasket } from "@/components/providers/basket-provider";
import { getBranchById } from "@/lib/branches";

export function BasketPage() {
  const { items, count, total, updateQuantity, removeItem } = useBasket();
  const branch = items[0] ? getBranchById(items[0].branchId) : undefined;

  return <main>
    <section className="bg-[#210013] pb-10 pt-28 text-white sm:pb-14 sm:pt-36"><div className="container-site"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-pink-light">Your selections</p><h1 className="mt-3 font-display text-5xl sm:text-7xl">Your basket.</h1><p className="mt-4 text-sm text-white/55">{count ? `${count} item${count === 1 ? "" : "s"} from ${branch?.name || "Pink Beauty"}` : "Your basket is ready when you are."}</p></div></section>
    <section className="section-shell bg-cream"><div className="container-site">
      {!items.length ? <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft sm:p-16"><ShoppingBag className="mx-auto text-pink" /><h2 className="mt-5 font-display text-4xl">Your basket is empty.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">Browse products and services, compare branch prices, and add your choice here.</p><Link href="/products-services" className="button-primary mt-6">Browse products & services</Link></div> :
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="grid gap-3">{items.map((item) => <article key={item.id} className="grid grid-cols-[82px_1fr] gap-4 rounded-2xl bg-white p-3 shadow-soft sm:grid-cols-[110px_1fr] sm:p-4"><div className="relative min-h-24 overflow-hidden rounded-xl bg-pink-light">{item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="110px" />}</div><div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl leading-none">{item.title}</h2><p className="mt-2 text-xs text-black/45">{item.variantName}</p><p className="mt-2 text-sm font-bold text-pink">£{item.unitPrice.toFixed(2)}</p></div><div className="flex items-center justify-between gap-3 sm:justify-end"><div className="flex items-center rounded-full border border-black/10"><button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.title} quantity`} className="grid h-9 w-9 place-items-center"><Minus size={13} /></button><span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title} quantity`} className="grid h-9 w-9 place-items-center"><Plus size={13} /></button></div><button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full text-black/35 transition hover:bg-pink-light hover:text-pink"><Trash2 size={15} /></button></div></div></article>)}</div>
        <aside className="rounded-[2rem] bg-[#210013] p-6 text-white shadow-soft sm:p-8 lg:sticky lg:top-6"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-pink-light">Basket summary</p><div className="mt-6 flex items-center justify-between border-y border-white/10 py-5"><span className="text-sm text-white/55">Total</span><span className="text-3xl font-bold">£{total.toFixed(2)}</span></div><div className="mt-5 rounded-2xl bg-white/5 p-4 text-[10px] leading-5 text-white/55">The branch will confirm appointment, course, collection or delivery arrangements where applicable. Review cancellation and returns information before payment.</div><Link href={`/checkout/${branch?.slug}/basket`} className="button-primary mt-6 w-full">Continue to checkout</Link><p className="mt-4 text-center text-[10px] leading-5 text-white/40">Payment is routed securely to {branch?.name}.</p></aside>
      </div>}
    </div></section>
  </main>;
}
