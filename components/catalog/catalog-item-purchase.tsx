"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";

export function CatalogItemPurchase({ item, branch }: { item: CatalogItem; branch: Branch }) {
  const { addItem } = useBasket();
  const variants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const variant = variants[selected];
  if (!variant) return <a href={`/contact?branchId=${branch.id}&catalogItem=${encodeURIComponent(item.handle)}`} className="button-primary mt-6">Enquire about this {item.kind === "product" ? "product" : "service"}</a>;

  function add() {
    const success = addItem({ branchId: branch.id, branchSlug: branch.slug, handle: item.handle, title: item.title, variantName: variant.name, unitPrice: variant.price, image: item.images[0] || "" });
    if (success) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  }

  return <div className="mt-7"><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/55">Choose option<select value={selected} onChange={(event) => setSelected(Number(event.target.value))} className="rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-bold normal-case tracking-normal text-ink outline-none">{variants.map((entry, index) => <option key={entry.name} value={index}>{entry.name} · £{entry.price.toFixed(2)}</option>)}</select></label><button type="button" onClick={add} className="button-primary mt-3 w-full">{added ? <><Check size={16} /> Added to basket</> : <><ShoppingBag size={16} /> Add to basket · £{variant.price.toFixed(2)}</>}</button></div>;
}
