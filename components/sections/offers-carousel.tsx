"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import type { Offer } from "@/lib/content";

export function OffersCarousel({ offers }: { offers: Offer[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    const next = (index + offers.length) % offers.length;
    const track = trackRef.current;
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    setActive(next);
  }, [offers.length]);

  useEffect(() => {
    if (paused || offers.length < 2) return;
    const interval = window.setInterval(() => goTo(active + 1), 6500);
    return () => window.clearInterval(interval);
  }, [active, goTo, offers.length, paused]);

  function syncActive() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.min(Math.max(index, 0), offers.length - 1));
  }

  return (
    <section id="offers" className="section-shell overflow-hidden bg-white">
      <div className="container-site">
        <div className="section-header flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Current offers</p>
            <h2 className="section-title">A little more<br className="hidden sm:block" /> to look forward to.</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => goTo(active - 1)} aria-label="Previous offer" className="grid h-12 w-12 place-items-center rounded-full border border-black/10 transition hover:border-pink hover:text-pink"><ArrowLeft size={18} /></button>
            <button onClick={() => goTo(active + 1)} aria-label="Next offer" className="grid h-12 w-12 place-items-center rounded-full bg-pink text-white transition hover:bg-pink-dark"><ArrowRight size={18} /></button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={syncActive}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl shadow-luxe [scrollbar-width:none] sm:rounded-[2rem] [&::-webkit-scrollbar]:hidden"
        >
          {offers.map((offer, index) => (
            <article key={offer.id} className="relative min-w-full snap-start overflow-hidden bg-[#290017] text-white">
              <div className="relative min-h-[440px] sm:min-h-[560px] lg:min-h-[620px]">
                <Image src={offer.image} alt={offer.title} fill priority={index === 0} className="object-cover" sizes="(min-width: 1440px) 1312px, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-5 sm:p-10 lg:items-center lg:p-16">
                  <div className="max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[.28em] text-pink-light sm:text-xs">{offer.eyebrow}</p>
                    <h3 className="mt-3 font-display text-5xl leading-[.9] tracking-[-.05em] sm:mt-5 sm:text-7xl">{offer.title}</h3>
                    <p className="mt-4 max-w-md text-xs leading-6 text-white/70 sm:mt-6 sm:text-sm sm:leading-7">{offer.description}</p>
                    {offer.price && <p className="mt-4 text-sm font-bold text-white sm:mt-6 sm:text-base">{offer.price}</p>}
                    <div className="mt-5 sm:mt-7">
                      {offer.action === "book"
                        ? <BookingLink label="Book offer" className="button-primary" intent={{ serviceSlug: offer.serviceSlug, source: `homepage-offer-${offer.id}` }} />
                        : <Link href={offer.href || "/contact?type=offer"} className="button-primary">Buy offer <ArrowUpRight size={16} /></Link>}
                    </div>
                  </div>
                </div>
                <span className="absolute right-5 top-5 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[.18em] backdrop-blur sm:right-8 sm:top-8">Offer {String(index + 1).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between sm:mt-5">
          <div className="flex gap-2" role="tablist" aria-label="Select offer">
            {offers.map((offer, index) => <button key={offer.id} onClick={() => goTo(index)} aria-label={`Show ${offer.title}`} aria-selected={active === index} role="tab" className={`h-1.5 rounded-full transition-all ${active === index ? "w-9 bg-pink" : "w-3 bg-black/15"}`} />)}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/35">Swipe to explore</p>
        </div>
      </div>
    </section>
  );
}
