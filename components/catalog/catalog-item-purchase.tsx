"use client";

import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";

export function CatalogItemPurchase({ item, branch, appearance = "dark" }: { item: CatalogItem; branch: Branch; appearance?: "dark" | "light" }) {
  const { addItem, items } = useBasket();
  const variants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const variant = variants[selected];
  const inBasket = items.some((basketItem) => basketItem.branchId === branch.id && basketItem.handle === item.handle);
  if (!variant) return <a href={`/contact?branchId=${branch.id}&catalogItem=${encodeURIComponent(item.handle)}`} className="button-primary mt-6">Enquire about this {item.kind === "product" ? "product" : "service"}</a>;

  function add() {
    const success = addItem({ branchId: branch.id, branchSlug: branch.slug, handle: item.handle, title: item.title, variantName: variant.name, unitPrice: variant.price, image: item.images[0] || "", kind: item.kind, duration: item.duration });
    if (success) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  }

  const isLight = appearance === "light";
  const note = item.kind === "product" ? "Collection or delivery availability and returns are confirmed before payment." : item.kind === "course" ? "Dates, entry requirements and enrolment terms are confirmed by the academy." : "Consultation, patch-test or suitability requirements may apply.";

  return <div className="mt-6">
    <p className={`text-[10px] font-bold uppercase tracking-[.16em] ${isLight ? "text-black/45" : "text-white/55"}`}>{variants.length === 1 ? "Your option" : "Choose an option"}</p>
    {variants.length <= 3 ? <div className="mt-2 grid gap-2">{variants.map((entry, index) => <button key={`${entry.name}-${entry.price}`} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} className={`flex min-h-12 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${selected === index ? "border-pink bg-pink-light/70 ring-1 ring-pink" : isLight ? "border-black/10 bg-white hover:border-pink/40" : "border-white/15 bg-white/5 hover:border-pink-light/40"}`}><span className={`flex items-center gap-3 text-sm font-bold ${isLight ? "text-ink" : "text-white"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border ${selected === index ? "border-pink bg-pink" : isLight ? "border-black/25" : "border-white/35"}`}>{selected === index && <Check size={10} className="text-white" />}</span>{entry.name}</span><span className={`text-sm font-bold ${isLight ? "text-pink-dark" : "text-pink-light"}`}>£{entry.price.toFixed(2)}</span></button>)}</div> : <select aria-label="Choose an option" value={selected} onChange={(event) => setSelected(Number(event.target.value))} className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none ${isLight ? "border-black/10 bg-white text-ink focus:border-pink" : "border-white/15 bg-white text-ink"}`}>{variants.map((entry, index) => <option key={`${entry.name}-${entry.price}`} value={index}>{entry.name} · £{entry.price.toFixed(2)}</option>)}</select>}
    <button type="button" onClick={add} className="button-primary mt-4 w-full">{added ? <><Check size={16} /> Added to basket</> : <><ShoppingBag size={16} /> Add to basket · £{variant.price.toFixed(2)}</>}</button>
    {inBasket && <Link href="/basket" className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold ${isLight ? "border-pink/25 bg-pink-light/40 text-pink-dark" : "border-white/25 bg-white/10 text-white"}`}><ShoppingBag size={16} /> View basket</Link>}
    <p className={`mt-4 text-[10px] leading-5 ${isLight ? "text-black/45" : "text-white/45"}`}>{note}</p>
  </div>;
}
