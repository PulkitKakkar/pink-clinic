import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ConcernCardContent,
  concernCardClassName,
} from "@/components/catalog/concern-card-content";
import type { CombinedCatalogItem } from "@/lib/catalog";
import type { TreatmentConcern } from "@/lib/concerns";

export type HomepageConcern = TreatmentConcern & { image?: string };

export function TreatmentConcerns({
  concerns,
  popularTreatments,
}: {
  concerns: HomepageConcern[];
  popularTreatments: CombinedCatalogItem[];
}) {
  return (
    <section
      id="treatment-concerns"
      className="section-shell scroll-mt-12 bg-white"
    >
      <div className="container-site">
        <div className="section-header grid gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <p className="eyebrow">Treatments by concern</p>
            <h2 className="section-title">
              Start with what you would like to improve.
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-sm leading-7 text-black/50">
              You do not need to know a treatment name. Explore your concern,
              understand the possible approaches and compare prices at both Pink
              locations.
            </p>
            <Link
              href="/treatment-finder"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-pink"
            >
              Not sure where to start? <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
            href="/products-services#beauty-wellness"
            className="button-primary w-full shrink-0 sm:w-auto"
          >
            Browse hair, nails &amp; beauty <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
