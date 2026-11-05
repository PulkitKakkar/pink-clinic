"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useState } from "react";
import type { Branch } from "@/lib/branches";
import type { CatalogItem } from "@/lib/catalog";

type BranchCourses = { branch: Branch; items: CatalogItem[] };
const groups = [
  { name: "VTCT Courses", logo: "/images/accreditation/vtct-skills.svg", copy: "Explore our professional beauty qualifications." },
  { name: "ABT Courses", logo: "/images/accreditation/abt.png", copy: "Explore our practical beauty training courses." },
] as const;

function CoursePrice({ item }: { item: CatalogItem }) {
  const prices = item.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0);
  if (!prices.length) return <span className="text-sm font-bold text-pink">Enquire for price</span>;
  const lowest = prices.reduce((a, b) => a.price < b.price ? a : b);
  const hasRange = prices.some((variant) => variant.price !== lowest.price);
  const format = (price: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
  return <span className="flex flex-wrap items-baseline gap-2"><span className="text-sm font-bold text-pink">{hasRange ? "From " : ""}{format(lowest.price)}</span>{lowest.compareAtPrice && lowest.compareAtPrice > lowest.price ? <span className="text-xs text-black/45 line-through" aria-label={`Original price ${format(lowest.compareAtPrice)}`}>{format(lowest.compareAtPrice)}</span> : null}</span>;
}

export function CourseCatalogue({ catalogues }: { catalogues: BranchCourses[] }) {
  const [selectedGroup, setSelectedGroup] = useState<string>("VTCT Courses");
  const academy = catalogues.find(({ branch }) => branch.slug === "reading-watlington-st");
  if (!academy) return null;
  const items = academy.items.filter((item) => item.tags.includes(selectedGroup)).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div>
      <div className="flex items-start gap-3 rounded-2xl bg-pink-light/50 p-5 sm:p-6">
        <MapPin size={20} className="mt-1 shrink-0 text-pink" />
        <div><p className="text-xs font-bold uppercase tracking-[.15em] text-pink">Our academy location</p><p className="mt-2 font-display text-2xl">{academy.branch.name}</p><p className="mt-1 text-sm text-black/60">{academy.branch.address}</p></div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-[1.4fr_1fr]" aria-label="Course collections">
        {groups.map((group) => <button key={group.name} type="button" aria-pressed={selectedGroup === group.name} aria-controls="academy-course-list" onClick={() => setSelectedGroup(group.name)} className={`rounded-2xl border p-5 text-left transition sm:p-6 ${selectedGroup === group.name ? "border-pink bg-pink-light/40 ring-1 ring-pink" : "border-black/10 bg-white hover:border-pink"}`}><span className="flex h-16 items-center"><Image src={group.logo} alt={group.name === "VTCT Courses" ? "VTCT Skills" : "ABT"} width={180} height={64} className="max-h-16 w-auto max-w-[180px] object-contain" /></span><span className="mt-4 block font-display text-3xl">{group.name}</span><span className="mt-2 block text-sm leading-6 text-black/60">{group.copy}</span></button>)}
      </div>
      <section id="academy-course-list" className="mt-8" aria-labelledby="academy-course-heading">
        <div aria-live="polite"><p className="eyebrow">Academy catalogue</p><h2 id="academy-course-heading" className="mt-2 font-display text-4xl">{selectedGroup}</h2><p className="mt-2 text-xs text-black/50">{items.length} courses at Watlington Street</p></div>
        <ul className="mt-5 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">
          {items.map((item) => <li key={item.handle}><Link href={`/products-services/${academy.branch.slug}/${item.handle}`} className="group flex items-center justify-between gap-4 p-5 transition hover:bg-pink-light/30 sm:p-6"><span className="min-w-0"><span className="block font-display text-xl leading-tight group-hover:text-pink sm:text-2xl">{item.title}</span><span className="mt-3 block"><CoursePrice item={item} /></span></span><span className="flex shrink-0 items-center gap-2 text-xs font-bold text-pink"><span className="hidden sm:inline">View course</span><ArrowUpRight size={20} /><span className="sr-only sm:hidden">View course</span></span></Link></li>)}
        </ul>
        {!items.length && <p className="mt-5 text-sm text-black/60">Please contact the academy for current courses and dates.</p>}
      </section>
    </div>
  );
}
