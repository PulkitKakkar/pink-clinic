"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Search, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBasket } from "@/components/providers/basket-provider";
import type { CatalogItem } from "@/lib/catalog";
import { matchesConcern, treatmentConcerns } from "@/lib/concerns";

const typeLabels: Record<string, string> = { all: "All", service: "Services", product: "Products", course: "Academy" };

function getPriceDisplay(item: CatalogItem, alwaysFrom = false) {
  const pricedVariants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
  if (!pricedVariants.length) return { current: "Contact us for price" };
  const cheapest = pricedVariants.reduce((lowest, variant) => variant.price < lowest.price ? variant : lowest);
  const hasRange = pricedVariants.some((variant) => variant.price !== cheapest.price);
  const original = cheapest.compareAtPrice && cheapest.compareAtPrice > cheapest.price ? `£${cheapest.compareAtPrice.toFixed(2)}` : undefined;
  return { current: `${alwaysFrom || hasRange ? "From " : ""}£${cheapest.price.toFixed(2)}`, original };
}

export function CatalogBrowser({ items, branchId = "", branchSlug = "", combined = false, hideTypeFilters = false, collectionEyebrow = "Our services", collectionTitle = "Browse collections" }: { items: CatalogItem[]; branchId?: string; branchSlug?: string; combined?: boolean; hideTypeFilters?: boolean; collectionEyebrow?: string; collectionTitle?: string }) {
  const { addItem, items: basketItems } = useBasket();
  const collections = useMemo(() => [...new Set(items.flatMap((item) => item.tags))].filter(Boolean).sort((a, b) => a === "Offers" ? -1 : b === "Offers" ? 1 : a.localeCompare(b)), [items]);
  const [type, setType] = useState("all");
  const [collection, setCollection] = useState("all");
  const [concern, setConcern] = useState("all");
  const [query, setQuery] = useState("");
  const [filtersRestored, setFiltersRestored] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.kind === type) && (collection === "all" || item.tags.includes(collection)) && (concern === "all" || matchesConcern(item, concern)) && `${item.title} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [collection, concern, items, query, type]);
  const collectionCards = useMemo(() => collections.slice(0, 8).map((name) => ({ name, item: items.find((item) => item.tags.includes(name) && item.images[0]) })), [collections, items]);
  const concernCards = useMemo(() => treatmentConcerns.map((entry) => ({ ...entry, item: items.find((item) => matchesConcern(item, entry) && item.images[0]) })).filter((entry) => entry.item), [items]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedType = params.get("catalogType");
    const savedCollection = params.get("catalogCollection");
    const frame = window.requestAnimationFrame(() => {
      if (savedType && savedType in typeLabels) setType(savedType);
      if (savedCollection && collections.includes(savedCollection)) setCollection(savedCollection);
      const savedConcern = params.get("concern");
      if (savedConcern && treatmentConcerns.some((entry) => entry.slug === savedConcern)) setConcern(savedConcern);
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
    if (concern === "all") url.searchParams.delete("concern");
    else url.searchParams.set("concern", concern);
    if (query) url.searchParams.set("catalogSearch", query);
    else url.searchParams.delete("catalogSearch");
    window.history.replaceState(window.history.state, "", url);
  }, [collection, concern, filtersRestored, query, type]);

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
      <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-full bg-white px-4 sm:w-96"><Search size={16} className="text-pink" /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder="What are you looking for?" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
      {!hideTypeFilters && <div className="flex flex-wrap gap-2">{Object.entries(typeLabels).filter(([value]) => value === "all" || items.some((item) => item.kind === value)).map(([value, label]) => <button key={value} type="button" aria-pressed={type === value} onClick={() => { setType(value); setVisibleCount(12); }} className={`min-h-11 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${type === value ? "bg-pink text-white" : "bg-white text-black/55 hover:text-pink"}`}>{label}</button>)}</div>}
    </div>
    {combined && !query && type === "all" && <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Start with your concern</p><h2 className="font-display text-4xl">Treatments by concern</h2></div>{concern !== "all" && <button type="button" onClick={() => { setConcern("all"); setVisibleCount(12); }} className="text-xs font-bold text-pink">Clear</button>}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{concernCards.map(({ slug, shortName, item }, index) => <div key={slug} className="grid gap-2"><button type="button" aria-pressed={concern === slug} onClick={() => { setConcern(slug); setCollection("all"); setVisibleCount(12); }} className={`group relative min-h-36 overflow-hidden rounded-2xl bg-[#210013] p-4 text-left text-white ring-offset-2 transition ${concern === slug ? "ring-2 ring-pink" : ""}`}>{item?.images[0] && <Image src={item.images[0]} alt="" fill priority={index === 0} className="object-cover opacity-45 transition group-hover:scale-105" sizes="(min-width: 640px) 33vw, 50vw" />}<span className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" /><span className="relative flex h-full items-end font-display text-2xl leading-none">{shortName}</span></button><Link href={`/concerns/${slug}`} className="px-1 text-[10px] font-bold text-pink underline underline-offset-4">Read the {shortName.toLowerCase()} guide</Link></div>)}</div></section>}
    {!query && type === "all" && <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">{combined ? "Or browse everything" : collectionEyebrow}</p><h2 className="font-display text-4xl">{combined ? "All treatment collections" : collectionTitle}</h2></div>{collection !== "all" && <button type="button" onClick={() => { setCollection("all"); setVisibleCount(12); }} className="text-xs font-bold text-pink">Clear</button>}</div>{!combined && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{collectionCards.map(({ name, item }, index) => <button key={name} type="button" aria-pressed={collection === name} onClick={() => { setCollection(name); setVisibleCount(12); }} className="group relative min-h-32 overflow-hidden rounded-2xl bg-[#210013] p-4 text-left text-white">{item?.images[0] && <Image src={item.images[0]} alt="" fill priority={index === 0} className="object-cover opacity-45 transition group-hover:scale-105" sizes="(min-width: 640px) 25vw, 50vw" />}<span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><span className="relative flex h-full items-end font-display text-xl leading-none">{name}</span></button>)}</div>}<details className="mt-4 rounded-2xl border border-black/5 bg-white p-4"><summary className="cursor-pointer text-xs font-bold text-pink">View all collections</summary><div className="mt-4 flex flex-wrap gap-2"><button type="button" aria-pressed={collection === "all"} onClick={() => { setCollection("all"); setVisibleCount(12); }} className={`min-h-11 rounded-full px-4 text-[10px] font-bold ${collection === "all" ? "bg-pink text-white" : "bg-cream"}`}>All collections</button>{collections.map((name) => <button key={name} type="button" aria-pressed={collection === name} onClick={() => { setCollection(name); setConcern("all"); setVisibleCount(12); }} className={`min-h-11 rounded-full px-4 text-[10px] font-bold ${collection === name ? "bg-pink text-white" : "bg-cream"}`}>{name}</button>)}</div></details></section>}
    <p className="my-5 text-xs text-black/45">{filtered.length} result{filtered.length === 1 ? "" : "s"} · showing {Math.min(visibleCount, filtered.length)}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.slice(0, visibleCount).map((item, index) => {
        const itemHref = combined ? `/products-services/item/${item.handle}` : `/products-services/${branchSlug}/${item.handle}`;
        const price = getPriceDisplay(item, combined);
        const variants = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
        const variantIndex = selectedVariants[item.handle] || 0;
        const selected = variants[variantIndex];
        const justAdded = addedItem === `${item.handle}:${selected?.name}`;
        const inBasket = basketItems.some((basketItem) => basketItem.branchId === branchId && basketItem.handle === item.handle);
        return <article key={item.handle} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
          <Link href={itemHref} className="relative block aspect-[4/3] overflow-hidden bg-pink-light"><Image src={item.images[0]} alt={item.title} fill priority={index === 0} className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" /></Link>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">{item.tags[0] || typeLabels[item.kind]}</p>
            <h2 className="mt-2 font-display text-2xl leading-none"><Link href={itemHref} className="transition hover:text-pink">{item.title}</Link></h2>
            <div className="mt-3 flex items-baseline gap-2"><p className="text-sm font-bold text-pink">{price.current}</p>{price.original && <p className="text-xs text-black/40 line-through" aria-label={`Original price ${price.original}`}>{price.original}</p>}</div>
            {combined && <Link href={itemHref} className="mt-auto inline-flex min-h-10 items-center justify-center rounded-full bg-pink px-4 text-xs font-bold text-white transition hover:bg-pink-dark">View branch prices</Link>}
            {!combined && <>
            {variants.length > 1 && <label className="mt-4 grid gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-black/40">Choose option<select value={variantIndex} onChange={(event) => setSelectedVariants((current) => ({ ...current, [item.handle]: Number(event.target.value) }))} className="rounded-xl border border-black/10 bg-cream px-3 py-2.5 text-xs font-bold normal-case tracking-normal text-ink outline-none focus:border-pink">{variants.map((variant, index) => <option key={variant.name} value={index}>{variant.name} · £{variant.price.toFixed(2)}</option>)}</select></label>}
            {variants.length ? <div className="mt-auto grid gap-2 pt-4"><button type="button" onClick={() => addCatalogItem(item, variants)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-pink px-4 text-xs font-bold text-white transition hover:bg-pink-dark">{justAdded ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to basket</>}</button>{inBasket ? <Link href="/basket" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-pink/20 bg-pink-light/50 px-4 text-xs font-bold text-pink"><ShoppingBag size={14} /> View basket</Link> : <Link href={`/checkout/${branchSlug}/catalog/${encodeURIComponent(item.handle)}`} className="text-center text-[10px] font-bold text-pink underline underline-offset-4">Buy now</Link>}</div> : <Link href={`/contact?branchId=${branchId}&catalogItem=${encodeURIComponent(item.handle)}`} className="mt-auto inline-flex pt-5 text-xs font-bold text-pink underline underline-offset-4">Enquire</Link>}
            </>}
          </div>
        </article>;
      })}
    </div>
    {visibleCount < filtered.length && <div className="mt-8 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="button-primary">Load 12 more</button><p className="mt-3 text-xs text-black/40">{Math.min(visibleCount, filtered.length)} of {filtered.length} shown</p></div>}
    {!filtered.length && <div className="rounded-2xl bg-white p-10 text-center text-sm text-black/50">No matching products or services.</div>}
  </div>;
}
