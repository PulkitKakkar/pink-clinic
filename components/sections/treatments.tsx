"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBranch } from "@/components/providers/branch-provider";
import type { Branch } from "@/lib/branches";
import { services } from "@/lib/content";
import { formatTreatmentPrice, pricingProvider } from "@/lib/pricing";

export function Treatments({ branch }: { branch?: Branch }) {
  const { selectedBranch } = useBranch();
  const activeBranch = branch ?? selectedBranch;
  return <section className="section-shell bg-white"><div className="container-site"><div className="section-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"><div><p className="eyebrow">{activeBranch ? `Prices at ${activeBranch.name}` : "Most popular"}</p><h2 className="section-title">Loved treatments</h2></div><Link href={activeBranch ? `/treatments/${activeBranch.slug}` : "/treatments/select-branch"} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-pink sm:text-xs">{activeBranch ? "View branch treatments" : "Choose branch"} <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">{services.map((service) => { const href = activeBranch ? `/treatments/${activeBranch.slug}/${service.slug}` : "/treatments/select-branch"; const price = activeBranch ? formatTreatmentPrice(pricingProvider.getTreatmentPrice(service.id, activeBranch.id)) : "Select branch for price"; return <Link href={href} key={service.slug} className="group grid grid-cols-[105px_1fr] overflow-hidden rounded-2xl border border-black/5 bg-cream sm:block sm:overflow-visible sm:border-0 sm:bg-transparent"><div className="relative min-h-full overflow-hidden bg-pink-light sm:aspect-[3/4] sm:rounded-[1.5rem]"><Image src={service.image} alt={service.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 105px" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><p className="absolute bottom-3 left-3 hidden text-[10px] font-bold uppercase tracking-[.2em] text-white sm:block">{service.category}</p></div><div className="flex items-center justify-between gap-3 p-4 sm:items-start sm:gap-4 sm:px-1 sm:pt-5"><div><p className="mb-1 text-[9px] font-bold uppercase tracking-[.14em] text-pink sm:hidden">{service.category}</p><h3 className="font-display text-xl leading-none tracking-tight sm:text-2xl">{service.title}</h3><p className="mt-2 text-[11px] text-black/45 sm:text-xs">{price}</p></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 transition group-hover:border-pink group-hover:bg-pink group-hover:text-white sm:h-9 sm:w-9"><ArrowRight size={14} /></span></div></Link>; })}</div></div></section>;
}
