"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ConcernCardContent,
  concernCardClassName,
} from "@/components/catalog/concern-card-content";
import type { CombinedCatalogItem } from "@/lib/catalog";
import { beautyServiceAreas, matchesBeautyServiceArea, type TreatmentConcern } from "@/lib/concerns";

export type HomepageConcern = TreatmentConcern & { image?: string };

export function TreatmentConcerns({
  concerns,
  popularTreatments,
  catalog,
}: {
  concerns: HomepageConcern[];
  popularTreatments: CombinedCatalogItem[];
  catalog: CombinedCatalogItem[];
}) {
  const [browseMode, setBrowseMode] = useState<"concern" | "area" | "type" | "all">("concern");
  const areaCards = useMemo(() => beautyServiceAreas.map((area) => ({
    ...area,
    item: catalog.find((item) => matchesBeautyServiceArea(item, area) && item.images[0]),
  })).filter((area) => area.item), [catalog]);
  const typeCards = useMemo(() => [
    { kind: "service", title: "Treatments & services", description: "Facials, aesthetic treatments and beauty appointments." },
    { kind: "product", title: "Skincare & products", description: "Professional products to support your routine." },
    { kind: "course", title: "Academy courses", description: "Professional training and qualifications." },
  ].map((entry) => ({ ...entry, item: catalog.find((item) => item.kind === entry.kind && item.images[0]) })).filter((entry) => entry.item), [catalog]);
  const allCards = useMemo(() => catalog.filter((item) => item.images[0]).slice(0, 6), [catalog]);
  const modeContent = {
    concern: { eyebrow: "Treatments by concern", title: "Start with what you would like to improve.", copy: "You do not need to know a treatment name. Explore your concern, understand the possible approaches and compare prices at both Pink locations.", href: "/products-services", link: "View all treatments by concern" },
    area: { eyebrow: "Treatments by body area", title: "Start with the area you would like to treat.", copy: "Explore suitable options for your face, body, hair, hands, feet and other treatment areas.", href: "/products-services?browse=area", link: "View all body-area treatments" },
    type: { eyebrow: "Treatments by type", title: "Choose the kind of treatment you are looking for.", copy: "Browse services, professional products and academy courses in one place.", href: "/products-services?browse=treatment-type", link: "View all treatment types" },
    all: { eyebrow: "All treatments", title: "Explore everything Pink Beauty offers.", copy: "See the full range of treatments, products, services and courses across both locations.", href: "/products-services?browse=all", link: "View the complete catalogue" },
  }[browseMode];
  return (
    <section
      id="treatment-concerns"
      className="section-shell scroll-mt-12 bg-white"
    >
      <div className="container-site">
        <div className="section-header grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <p className="eyebrow">{modeContent.eyebrow}</p>
            <h2 className="section-title">
              {modeContent.title}
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-sm leading-7 text-black/50">
              {modeContent.copy}
            </p>
            <Link
              href="/treatment-finder"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-pink"
            >
              Not sure where to start? <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <nav className="mt-7 flex flex-wrap gap-2" aria-label="Browse treatments">
          {[
            { id: "concern", label: "By concern" },
            { id: "area", label: "By body area" },
            { id: "type", label: "By treatment type" },
            { id: "all", label: "All treatments" },
          ].map((mode) => (
            <button key={mode.id} type="button" aria-pressed={browseMode === mode.id} onClick={() => setBrowseMode(mode.id as typeof browseMode)} className={`inline-flex min-h-11 items-center rounded-full px-4 text-[10px] font-bold uppercase tracking-[.12em] transition ${browseMode === mode.id ? "bg-pink text-white" : "bg-cream text-black/60 hover:text-pink"}`}>
              {mode.label}
            </button>
          ))}
        </nav>
        {browseMode === "concern" && <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {concerns.map((concern, index) => (
            <Link
              key={concern.slug}
              href={`/concerns/${concern.slug}`}
              className={concernCardClassName}
            >
              <ConcernCardContent
                concern={concern}
                image={concern.image}
                priority={index === 0}
              />
            </Link>
          ))}
          {popularTreatments[0] && (
            <Link
              href="/products-services"
              className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink text-white shadow-soft sm:min-h-[360px] sm:rounded-[1.5rem]"
            >
              {popularTreatments[0].images[0] && (
                <Image
                  src={popularTreatments[0].images[0]}
                  alt=""
                  fill
                  className="object-cover opacity-55 transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-pink-berry via-pink/45 to-pink/10" />
              <span className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <span className="block text-[8px] font-bold uppercase tracking-[.12em] text-pink-light sm:text-[9px] sm:tracking-[.2em]">
                  Popular at Pink
                </span>
                <span className="mt-2 block font-display text-2xl leading-none sm:text-4xl">
                  Customer choices &amp; offers
                </span>
                <span className="mt-3 hidden text-xs leading-5 text-white/70 sm:block">
                  Browse popular customer choices alongside current offers and promotions.
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.1em] sm:mt-5 sm:gap-2 sm:text-[10px] sm:tracking-[.15em]">
                  Explore choices &amp; offers <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          )}
        </div>}
        {browseMode === "area" && <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {areaCards.map(({ slug, name, description, item }) => <Link key={slug} href={`/products-services?browse=area&serviceArea=${slug}`} className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink-berry text-white shadow-soft sm:min-h-[300px] sm:rounded-[1.5rem]">
            {item?.images[0] && <Image src={item.images[0]} alt="" fill className="object-cover opacity-65 transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 50vw" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-4 sm:p-7"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-pink-light">Body area</span><span className="mt-2 block font-display text-2xl leading-none sm:text-4xl">{name}</span><span className="mt-3 hidden text-xs leading-5 text-white/65 sm:block">{description}</span><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em]">Explore <ArrowRight size={14} /></span></span>
          </Link>)}
        </div>}
        {browseMode === "type" && <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {typeCards.map(({ kind, title, description, item }) => <Link key={kind} href={`/products-services?browse=treatment-type&catalogType=${kind}`} className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink-berry text-white shadow-soft sm:min-h-[300px] sm:rounded-[1.5rem]">
            {item?.images[0] && <Image src={item.images[0]} alt="" fill className="object-cover opacity-65 transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />}
            <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-pink-light">Browse type</span><span className="mt-2 block font-display text-3xl leading-none">{title}</span><span className="mt-3 block text-xs leading-5 text-white/65">{description}</span></span>
          </Link>)}
        </div>}
        {browseMode === "all" && <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {allCards.map((item) => <Link key={item.handle} href={`/products-services/item/${item.handle}`} className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink-berry text-white shadow-soft sm:min-h-[300px] sm:rounded-[1.5rem]">
            <Image src={item.images[0]} alt="" fill className="object-cover opacity-65 transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 50vw" /><span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-4 sm:p-7"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-pink-light">Pink Beauty</span><span className="mt-2 block font-display text-2xl leading-none sm:text-4xl">{item.title}</span><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em]">View treatment <ArrowRight size={14} /></span></span>
          </Link>)}
        </div>}
        <div className="mt-7 text-center">
          <Link href={modeContent.href} className="button-primary">
            {modeContent.link} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-pink/15 bg-pink-light/70 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-pink">
              More salon services
            </p>
            <h3 className="font-display text-2xl">
              Looking for hair, nails or everyday beauty?
            </h3>
            <p className="mt-1 text-xs leading-6 text-black/50">
              Hair, nails and everyday salon services remain available in the
              complete catalogue.
            </p>
          </div>
          <Link
            href="/products-services?browse=area"
            className="button-primary w-full shrink-0 sm:w-auto"
          >
            Browse hair, nails &amp; beauty <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
