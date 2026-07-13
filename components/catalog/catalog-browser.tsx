"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { CatalogItem } from "@/lib/catalog";

const typeLabels: Record<string, string> = { all: "All", service: "Services", product: "Products", course: "Academy" };

function getPriceDisplay(item: CatalogItem) {
  const pricedVariants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
  if (!pricedVariants.length) return { current: "Contact us for price" };
  const cheapest = pricedVariants.reduce((lowest, variant) => variant.price < lowest.price ? variant : lowest);
  const hasRange = pricedVariants.some((variant) => variant.price !== cheapest.price);
  const original = cheapest.compareAtPrice && cheapest.compareAtPrice > cheapest.price ? `£${cheapest.compareAtPrice.toFixed(2)}` : undefined;
  return { current: `${hasRange ? "From " : ""}£${cheapest.price.toFixed(2)}`, original };
}

export function CatalogBrowser({ items, branchId }: { items: CatalogItem[]; branchId: string }) {
  const [type, setType] = useState("all");
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const collections = useMemo(() => [...new Set(items.flatMap((item) => item.tags))].filter(Boolean).sort(), [items]);
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.kind === type) && (collection === "all" || item.tags.includes(collection)) && `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [collection, items, query, type]);

  return <div><div className="grid gap-4 rounded-2xl bg-pink-light/45 p-4 lg:grid-cols-[1fr_auto] lg:items-center sm:p-5"><div className="flex flex-wrap gap-2">{Object.entries(typeLabels).map(([value, label]) => <button key={value} type="button" onClick={() => setType(value)} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${type === value ? "bg-pink text-white" : "bg-white text-black/55 hover:text-pink"}`}>{label}</button>)}</div><div className="grid gap-3 sm:grid-cols-2"><select aria-label="Filter by collection" value={collection} onChange={(event) => setCollection(event.target.value)} className="rounded-full bg-white px-4 py-2.5 text-xs font-bold outline-none"><option value="all">All collections</option>{collections.map((name) => <option key={name} value={name}>{name}</option>)}</select><label className="flex min-w-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:w-72"><Search size={15} className="text-pink" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products & services" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label></div></div>
    <p className="my-5 text-xs text-black/45">Showing {filtered.length} of {items.length} items</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((item) => { const price = getPriceDisplay(item); return <article key={item.handle} className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft"><div className="relative aspect-[4/3] overflow-hidden bg-pink-light"><Image src={item.images[0]} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" /></div><div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">{item.tags[0] || typeLabels[item.kind]}</p><h2 className="mt-2 font-display text-2xl leading-none">{item.title}</h2><div className="mt-3 flex items-baseline gap-2"><p className="text-sm font-bold text-pink">{price.current}</p>{price.original && <p className="text-xs text-black/40 line-through" aria-label={`Original price ${price.original}`}>{price.original}</p>}</div>{item.variants.length > 1 && <p className="mt-1 text-[10px] text-black/40">{item.variants.length} options available</p>}<Link href={`/contact?branchId=${branchId}&catalogItem=${encodeURIComponent(item.handle)}`} className="mt-5 inline-flex text-xs font-bold text-pink underline underline-offset-4">Book or enquire</Link></div></article>; })}</div>
    {!filtered.length && <div className="rounded-2xl bg-white p-10 text-center text-sm text-black/50">No matching products or services.</div>}
  </div>;
}
