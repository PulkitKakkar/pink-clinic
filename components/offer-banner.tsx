"use client";

import Link from "next/link";
import { Pause, Play, Sparkles } from "lucide-react";
import { useState } from "react";

export type Promotion = { label: string; href: string };

export function OfferBanner({ offers }: { offers: Promotion[] }) {
  const [paused, setPaused] = useState(false);
  if (!offers.length) return null;
  return (
    <aside
      aria-label="Current Pink Beauty offers"
      className="offer-ticker relative overflow-hidden border-y border-white/15 bg-pink pr-10 text-white sm:pr-11"
    >
      <div className={`offer-ticker-track flex h-14 w-max items-center ${paused ? "[animation-play-state:paused]" : ""}`}>
        <OfferSequence offers={offers} />
        <div aria-hidden="true">
          <OfferSequence offers={offers} duplicate />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center border-l border-white/20 bg-pink-dark sm:w-11"
        aria-label={paused ? "Play offer banner" : "Pause offer banner"}
      >
        {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
      </button>
    </aside>
  );
}

function OfferSequence({
  offers,
  duplicate = false,
}: {
  offers: Promotion[];
  duplicate?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {offers.map((offer) => (
        <Link
          key={`${duplicate ? "duplicate-" : ""}${offer.href}`}
          href={offer.href}
          tabIndex={duplicate ? -1 : undefined}
          className="inline-flex min-h-14 items-center gap-2 whitespace-nowrap px-1 text-[11px] font-bold uppercase tracking-[.12em] sm:text-xs sm:tracking-[.14em]"
        >
          <Sparkles size={12} aria-hidden="true" />
          {offer.label}
          <span aria-hidden="true">→</span>
        </Link>
      ))}
    </div>
  );
}
