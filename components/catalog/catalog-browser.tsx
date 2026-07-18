"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Search, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
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

export function CatalogBrowser({ items, branchId, branchSlug }: { items: CatalogItem[]; branchId: string; branchSlug: string }) {
  const { addItem } = useBasket();
  const collections = useMemo(() => [...new Set(items.flatMap((item) => item.tags))].filter(Boolean).sort((a, b) => a === "Offers" ? -1 : b === "Offers" ? 1 : a.localeCompare(b)), [items]);
  const [type, setType] = useState("all");
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const [filtersRestored, setFiltersRestored] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.kind === type) && (collection === "all" || item.tags.includes(collection)) && `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [collection, items, query, type]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedType = params.get("catalogType");
    const savedCollection = params.get("catalogCollection");
    const frame = window.requestAnimationFrame(() => {
      if (savedType && savedType in typeLabels) setType(savedType);
      if (savedCollection && collections.includes(savedCollection)) setCollection(savedCollection);
      setQuery(params.get("catalogSearch") || "");
      setFiltersRestored(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [collections]);

  useEffect(() => {
    if (!filtersRestored) return;
    const url = new URL(window.location.href);
    if (type === "all") url.searchParams.delete("catalogType");
    else url.searchParams.set("catalogType", type);
    if (collection === "all") url.searchParams.delete("catalogCollection");
    else url.searchParams.set("catalogCollection", collection);
    if (query) url.searchParams.set("catalogSearch", query);
    else url.searchParams.delete("catalogSearch");
    window.history.replaceState(window.history.state, "", url);
  }, [collection, filtersRestored, query, type]);

  function addCatalogItem(item: CatalogItem, variants: CatalogItem["variants"]) {
    const variant = variants[selectedVariants[item.handle] || 0];
    if (!variant) return;
    if (addItem({ branchId, branchSlug, handle: item.handle, title: item.title, variantName: variant.name, unitPrice: variant.price, image: item.images[0] || "" })) {
      setAddedItem(`${item.handle}:${variant.name}`);
      window.setTimeout(() => setAddedItem(null), 1800);
    }
  }

  return <div>
    <div className="grid gap-4 rounded-2xl bg-pink-light/45 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">{Object.entries(typeLabels).map(([value, label]) => <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${type === value ? "bg-pink text-white" : "bg-white text-black/55 hover:text-pink"}`}>{label}</button>)}</div>
        <label className="flex min-w-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 sm:w-72"><Search size={15} className="text-pink" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products & services" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
      </div>
      <div className="border-t border-pink/10 pt-4"><p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-black/40">Browse collections</p><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={collection === "all"} onClick={() => setCollection("all")} className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${collection === "all" ? "bg-pink text-white" : "bg-white text-black/55 hover:text-pink"}`}>All collections</button>{collections.map((name) => <button key={name} type="button" aria-pressed={collection === name} onClick={() => setCollection(name)} className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${collection === name ? "bg-pink text-white" : "bg-white text-black/55 hover:text-pink"}`}>{name}</button>)}</div></div>
    </div>
    <p className="my-5 text-xs text-black/45">Showing {filtered.length} of {items.length} items</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((item) => {
        const price = getPriceDisplay(item);
        const variants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
        const variantIndex = selectedVariants[item.handle] || 0;
        const selected = variants[variantIndex];
        const justAdded = addedItem === `${item.handle}:${selected?.name}`;
        return <article key={item.handle} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
          <Link href={`/products-services/${branchSlug}/${item.handle}`} className="relative block aspect-[4/3] overflow-hidden bg-pink-light"><Image src={item.images[0]} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" /></Link>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">{item.tags[0] || typeLabels[item.kind]}</p>
            <h2 className="mt-2 font-display text-2xl leading-none"><Link href={`/products-services/${branchSlug}/${item.handle}`} className="transition hover:text-pink">{item.title}</Link></h2>
            <div className="mt-3 flex items-baseline gap-2"><p className="text-sm font-bold text-pink">{price.current}</p>{price.original && <p className="text-xs text-black/40 line-through" aria-label={`Original price ${price.original}`}>{price.original}</p>}</div>
            {variants.length > 1 && <label className="mt-4 grid gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-black/40">Choose option<select value={variantIndex} onChange={(event) => setSelectedVariants((current) => ({ ...current, [item.handle]: Number(event.target.value) }))} className="rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-xs font-bold normal-case tracking-normal text-ink outline-none focus:border-pink">{variants.map((variant, index) => <option key={variant.name} value={index}>{variant.name} · £{variant.price.toFixed(2)}</option>)}</select></label>}
            {variants.length ? <div className="mt-auto grid gap-2 pt-4"><button type="button" onClick={() => addCatalogItem(item, variants)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-pink px-4 text-xs font-bold text-white transition hover:bg-pink-dark">{justAdded ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to basket</>}</button><Link href={`/checkout/${branchSlug}/catalog/${encodeURIComponent(item.handle)}`} className="text-center text-[10px] font-bold text-pink underline underline-offset-4">Buy now</Link></div> : <Link href={`/contact?branchId=${branchId}&catalogItem=${encodeURIComponent(item.handle)}`} className="mt-auto inline-flex pt-5 text-xs font-bold text-pink underline underline-offset-4">Enquire</Link>}
          </div>
        </article>;
      })}
    </div>
    {!filtered.length && <div className="rounded-2xl bg-white p-10 text-center text-sm text-black/50">No matching products or services.</div>}
  </div>;
}
