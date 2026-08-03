"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogItem } from "@/lib/catalog";
import { matchesConcern, treatmentConcerns } from "@/lib/concerns";

const downtimeOptions = [
  "Little to no downtime",
  "A few days is okay",
  "I’m flexible",
];
const priorityOptions = [
  "A subtle, natural result",
  "A noticeable improvement",
  "A longer-term treatment plan",
];

export function TreatmentFinder({ items }: { items: CatalogItem[] }) {
  const [concern, setConcern] = useState("");
  const [downtime, setDowntime] = useState("");
  const [priority, setPriority] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const wasComplete = useRef(false);
  const complete = Boolean(concern && downtime && priority);
  const results = useMemo(() => complete ? items.filter((item) => item.kind === "service" && matchesConcern(item, concern)).slice(0, 6) : [], [complete, concern, items]);

  useEffect(() => {
    if (complete && !wasComplete.current) {
      const frame = window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      wasComplete.current = complete;
      return () => window.cancelAnimationFrame(frame);
    }

    wasComplete.current = complete;
  }, [complete]);

  return <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-12">
    <div className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
      <FinderQuestion number="1" title="What would you most like to improve?" hint="Choose the concern that feels most important to you right now." value={concern} options={treatmentConcerns.map((entry) => ({ value: entry.slug, label: entry.shortName }))} onChange={setConcern} />
      <FinderQuestion number="2" title="How much recovery time works for you?" hint="Some treatments may involve redness, swelling or time away from your usual routine." value={downtime} options={downtimeOptions.map((label) => ({ value: label, label }))} onChange={setDowntime} />
      <FinderQuestion number="3" title="What kind of result are you hoping for?" hint="Your practitioner will discuss what is realistic and suitable during consultation." value={priority} options={priorityOptions.map((label) => ({ value: label, label }))} onChange={setPriority} />
      {(concern || downtime || priority) && <button type="button" onClick={() => { setConcern(""); setDowntime(""); setPriority(""); }} className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-pink"><RotateCcw size={14} /> Start again</button>}
    </div>
    <div ref={resultsRef} aria-live="polite" className="scroll-mt-28">
      {!complete ? <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-pink/25 bg-pink-light/30 p-8 text-center"><div><p className="eyebrow justify-center">Your starting point</p><h2 className="font-display text-4xl">Tell us what matters to you.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">Complete the three short questions to see relevant treatments. This guide does not replace a consultation.</p></div></div> : <div><p className="eyebrow">Suggested starting points</p><h2 className="section-title">Treatments to discuss with Pink.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">Based on your interest in {treatmentConcerns.find((entry) => entry.slug === concern)?.shortName.toLowerCase()}. We have noted that you prefer “{downtime.toLowerCase()}” and “{priority.toLowerCase()}”; use these as discussion points with your practitioner. Suitability and the best plan are always confirmed by Pink.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{results.map((item) => <Link key={item.handle} href={`/products-services/item/${item.handle}`} className="group flex overflow-hidden rounded-2xl bg-white shadow-soft"><div className="relative w-28 shrink-0 bg-pink-light">{item.images[0] && <Image src={item.images[0]} alt="" fill className="object-cover transition group-hover:scale-105" sizes="112px" />}</div><div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-5"><div><h3 className="font-display text-xl leading-none">{item.title}</h3><p className="mt-2 text-[10px] font-bold uppercase tracking-[.12em] text-pink">Compare branch prices</p></div><ArrowRight size={16} className="shrink-0 text-pink" /></div></Link>)}{!results.length && <div className="rounded-2xl bg-white p-7 text-sm leading-7 text-black/55 sm:col-span-2">We do not have a direct online match yet. <Link href="/contact" className="font-bold text-pink underline underline-offset-4">Contact Pink for a personal recommendation.</Link></div>}</div></div>}
    </div>
  </div>;
}

function FinderQuestion({ number, title, hint, value, options, onChange }: { number: string; title: string; hint: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <fieldset className="border-b border-black/5 py-6 first:pt-0 last:border-0"><legend className="flex gap-3 text-sm font-bold"><span className="text-pink">{number}.</span>{title}</legend><p className="mt-2 text-xs leading-5 text-black/45">{hint}</p><div className="mt-4 flex flex-wrap gap-2">{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-11 rounded-full px-4 text-xs font-bold transition ${value === option.value ? "bg-pink text-white" : "bg-cream text-black/60 hover:text-pink"}`}>{option.label}</button>)}</div></fieldset>;
}
