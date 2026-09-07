"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export type ConsultationTemplateSummary = {
  slug: string;
  title: string;
  description: string;
};

export function ConsultationTemplatePicker({ templates }: { templates: ConsultationTemplateSummary[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTemplates = templates.filter((template) =>
    [template.title, template.description].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <>
      <label className="relative mt-5 block max-w-lg">
        <span className="sr-only">Search consultation forms</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search consultation forms" className="w-full rounded-xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-pink" />
      </label>
      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visibleTemplates.map((template) => (
          <Link key={template.slug} href={`/admin/consultations/${template.slug}`} className="group rounded-2xl border border-black/5 bg-white p-5 shadow-soft transition hover:-translate-y-1">
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">Client consultation</p>
            <h3 className="mt-3 font-display text-2xl leading-none">{template.title}</h3>
            <p className="mt-3 text-xs leading-5 text-black/45">{template.description}</p>
            <span className="mt-5 flex items-center gap-2 text-xs font-bold text-pink">Open form <ArrowRight size={14} /></span>
          </Link>
        ))}
      </div>
      {!visibleTemplates.length && <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-black/45">No consultation forms match that search.</p>}
    </>
  );
}
