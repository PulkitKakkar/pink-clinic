import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TreatmentConcern } from "@/lib/concerns";

export type HomepageConcern = TreatmentConcern & { image?: string };

export function TreatmentConcerns({
  concerns,
}: {
  concerns: HomepageConcern[];
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
              className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-pink-berry text-white shadow-soft sm:min-h-[360px] sm:rounded-[1.5rem]"
            >
              {concern.image && (
                <Image
                  src={concern.image}
                  alt=""
                  fill
                  priority={index === 0}
                  className="object-cover opacity-65 transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <span className="block text-[8px] font-bold uppercase tracking-[.12em] text-pink-light sm:text-[9px] sm:tracking-[.2em]">
                  Concern guide
                </span>
                <span className="mt-2 block font-display text-2xl leading-none sm:text-4xl">
                  {concern.shortName}
                </span>
                <span className="mt-3 hidden text-xs leading-5 text-white/65 sm:block">
                  {concern.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.1em] sm:mt-5 sm:gap-2 sm:text-[10px] sm:tracking-[.15em]">
                  Explore treatments{" "}
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-pink-light/55 p-5 sm:p-7">
          <div>
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
            className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-pink"
          >
            Browse salon services <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
