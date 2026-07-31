import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookingLink } from "@/components/ui/booking-link";
import type { Offer } from "@/lib/content";

export function OffersCarousel({ offers }: { offers: Offer[] }) {
  return (
    <section id="offers" className="section-shell bg-white">
      <div className="container-site">
        <div className="section-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Current offers</p>
            <h2 className="section-title">A little more to look forward to.</h2>
          </div>
          <Link
            href="/products-services?catalogCollection=Offers"
            className="inline-flex items-center gap-2 text-xs font-bold text-pink"
          >
            View all offers <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {offers.slice(0, 3).map((offer, index) => (
            <article
              key={offer.id}
              className="group flex overflow-hidden rounded-2xl border border-black/5 bg-cream shadow-soft md:flex-col"
            >
              <div className="relative w-28 shrink-0 bg-pink-light md:aspect-[4/3] md:w-full">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  priority={index === 0}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 112px"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[8px] font-bold uppercase tracking-[.18em] text-pink">
                  {offer.eyebrow}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-none">
                  {offer.title}
                </h3>
                <p className="mt-3 hidden text-xs leading-6 text-black/50 sm:block">
                  {offer.description}
                </p>
                {offer.price && (
                  <p className="mt-3 text-xs font-bold text-pink">
                    {offer.price}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  {offer.action === "book" ? (
                    <BookingLink
                      label="View offer"
                      className="inline-flex min-h-11 items-center text-xs font-bold text-pink"
                      intent={{
                        serviceSlug: offer.serviceSlug,
                        source: `homepage-offer-${offer.id}`,
                      }}
                    />
                  ) : (
                    <Link
                      href={offer.href || "/contact?type=offer"}
                      className="inline-flex min-h-11 items-center text-xs font-bold text-pink"
                    >
                      View offer <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
