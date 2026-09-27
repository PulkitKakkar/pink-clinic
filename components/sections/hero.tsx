import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#230013] text-white lg:min-h-[720px]">
      <Image
        src="/images/photoshoot/founder-reception-hero.jpg"
        alt="Chandni, founder of Pink Beauty, at reception"
        fill
        priority
        className="object-cover object-[center_24%] opacity-75 scale-[1.18] translate-x-[4%] -translate-y-[10%] lg:hidden"
        sizes="100vw"
      />
      <Image
        src="/images/photoshoot/founder-reception-hero.jpg"
        alt="Chandni, founder of Pink Beauty, at reception"
        fill
        priority
        className="hidden object-cover object-[center_60%] opacity-75 scale-[1.12] translate-x-[10%] -translate-y-[10%] lg:block"
        sizes="(min-width: 1024px) 100vw, 0px"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,0,19,.92)_0%,rgba(72,0,42,.64)_48%,rgba(228,1,127,.28)_100%)]" />
      <div className="noise absolute inset-0 opacity-40" />
      <div className="container-site relative flex pb-10 sm:pb-14 lg:min-h-[720px] lg:items-start lg:pb-32">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.28em] text-white/75 sm:mb-8 sm:text-[10px]">
            <span className="h-px w-8 bg-pink" />
            Our story
          </div>
          <h1 className="font-display text-[clamp(3rem,7.5vw,6.4rem)] leading-[.87] tracking-[-.055em]">
            <span className="font-sans text-[.74em] tracking-[-.07em]">18</span>{" "}years of
            <br />
            <span className="text-pink">expertise. Built</span>
            <br />
            around confidence.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:mt-7 sm:text-lg sm:leading-7">
            Since 2008, Pink has delivered advanced aesthetics and expert
            beauty with a personal standard of care across two Reading
            locations.
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-pink-light">
            VTCT-qualified • Fully insured • Expert practitioners • Accredited academy
          </p>
          <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:mt-8">
            <Link href="/products-services?audience=women#catalog-results" className="button-primary min-h-10 px-3 py-2 text-[11px] leading-tight sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">
              Browse by concern
            </Link>
            <Link href="/products-services?audience=women&browse=area#catalog-results" className="button-outline min-h-10 px-3 py-2 text-[11px] leading-tight sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">
              Browse by body area
            </Link>
            <Link href="/products-services?audience=women&browse=treatment-type#catalog-results" className="button-outline min-h-10 px-3 py-2 text-[11px] leading-tight sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">
              Browse by treatment type
            </Link>
            <Link href="/products-services?audience=women&browse=all#catalog-results" className="button-outline min-h-10 px-3 py-2 text-[11px] leading-tight sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">
              View all treatments
            </Link>
            <Link
              href="/courses"
              className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-full bg-pink-light px-4 py-2 text-[11px] font-bold text-pink-dark shadow-[0_14px_32px_rgba(228,1,127,.18)] transition hover:-translate-y-0.5 hover:bg-white sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm"
            >
              Want to learn? Explore our academy
            </Link>
            <Link href="/treatment-finder" className="button-outline col-span-2 min-h-10 px-3 py-2 text-[11px] leading-tight sm:min-h-12 sm:px-7 sm:py-3 sm:text-sm">
              Help me choose
            </Link>
          </div>
          <div className="mt-6 flex min-h-11 items-center gap-3 text-[10px] text-white/70 sm:mt-10 sm:gap-4 sm:text-xs">
            <span className="flex text-[#ffcb69]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </span>
            <span className="font-bold text-white">
              Trusted by clients across both Reading locations
            </span>
          </div>
        </div>
      </div>
      <a
        href="#treatment-concerns"
        className="absolute bottom-8 right-8 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/55 sm:flex"
      >
        Explore treatments{" "}
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25">
          <ArrowDown size={15} />
        </span>
      </a>
    </section>
  );
}
