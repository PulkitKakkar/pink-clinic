import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { locations } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pink Beauty Salon Locations in Reading",
  description: "Visit Pink Beauty Salon at West Street or Watlington Street in Reading.",
};

export default function LocationsPage() {
  return <main><PageHero eyebrow="Visit Pink Beauty" title="Two salons. One trusted standard." copy="Choose the Reading location that works best for your treatment journey." image="/images/watlington.jpg" /><section className="section-shell bg-cream"><div className="container-site grid gap-4 sm:gap-6 lg:grid-cols-2">{locations.map((location) => <article key={location.slug} className="grid grid-cols-[110px_1fr] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft sm:block sm:rounded-[2rem]"><div className="relative min-h-full sm:aspect-[16/10]"><Image src={location.image} alt={`${location.name} Pink Beauty salon`} fill className="object-cover" sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 110px" /></div><div className="flex flex-col items-start p-4 sm:p-9"><p className="hidden text-[10px] font-bold uppercase tracking-[.2em] text-pink sm:block">{location.note}</p><h2 className="font-display text-[1.65rem] leading-none tracking-tight sm:mt-3 sm:text-4xl">{location.name}</h2><div className="mt-2 grid gap-1 text-[11px] leading-4 text-black/50 sm:mt-4 sm:gap-2 sm:text-sm sm:leading-6"><p className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-pink sm:h-[17px] sm:w-[17px]" />{location.address}</p><p className="hidden gap-2 sm:flex"><Phone size={17} className="mt-0.5 shrink-0 text-pink" />{location.phone}</p></div><Link href={`/locations/${location.slug}`} className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-pink px-4 py-2 text-[11px] font-bold text-white shadow-[0_10px_24px_rgba(228,1,127,.2)] transition hover:bg-pink-dark sm:mt-7 sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">View location <ArrowRight size={14} className="sm:h-4 sm:w-4" /></Link></div></article>)}</div></section></main>;
}
