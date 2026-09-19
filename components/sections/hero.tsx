import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#230013] text-white lg:min-h-[720px]">
      <Image
        src="/gallery/photos/8J4A1210.jpg"
        alt="Chandni, founder of Pink Beauty"
        fill
        priority
        className="object-cover object-[center_20%] opacity-75 scale-[1.3] translate-x-[18%] lg:hidden"
        sizes="100vw"
      />
      <Image
        src="/images/photoshoot/home-hero.jpg"
        alt="Pink Beauty team welcoming clients at the Reading clinic"
        fill
        priority
        className="hidden object-cover object-center opacity-75 -scale-x-100 lg:block"
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
          <h1 className="font-display text-[clamp(3.6rem,10vw,8rem)] leading-[.82] tracking-[-.065em]">
            Born in Reading.
            <br />
            <span className="text-pink">Built around</span>
            <br />
            confidence.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:mt-7 sm:text-lg sm:leading-7">
            From our first Reading salon to two specialist destinations, Pink
            brings together advanced aesthetics and expert beauty with one
            personal standard of care.
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-pink-light">
            Advanced skin and aesthetic treatments across two Reading locations
          </p>
          <div className="mt-6 grid max-w-2xl gap-2 sm:mt-8 sm:grid-cols-2">
            <Link href="/products-services#catalog-results" className="button-primary justify-center">
              Browse by concern
            </Link>
            <Link href="/products-services?browse=area#catalog-results" className="button-outline justify-center">
              Browse by body area
            </Link>
            <Link href="/products-services?browse=treatment-type#catalog-results" className="button-outline justify-center">
              Browse by treatment type
            </Link>
            <Link href="/products-services?browse=all#catalog-results" className="button-outline justify-center">
              View all treatments
            </Link>
            <Link href="/treatment-finder" className="button-outline justify-center sm:col-span-2">
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
