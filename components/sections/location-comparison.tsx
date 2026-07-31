import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { locations } from "@/lib/content";

const locationFocus = [
  {
    title: "Salon, hair & everyday beauty",
    text: "Choose West Street for hair, nails, brows, lashes, facials and regular beauty appointments.",
  },
  {
    title: "Advanced clinic & aesthetics",
    text: "Choose Watlington Street for advanced skin, aesthetics, laser, wellness and consultation-led treatments.",
  },
];

export function LocationComparison() {
  return (
    <section className="section-shell bg-cream">
      <div className="container-site">
        <div className="section-header grid gap-4 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <p className="eyebrow">Two Pink locations</p>
            <h2 className="section-title">
              Choose the right setting for your visit.
            </h2>
          </div>
          <p className="text-sm leading-7 text-black/50">
            Treatment pages show exact availability and branch prices. If you
            are unsure, the team can direct you to the right location.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {locations.map((location, index) => (
            <article
              key={location.id}
              className="grid overflow-hidden rounded-[2rem] bg-white shadow-soft sm:grid-cols-[.9fr_1.1fr]"
            >
              <div className="relative min-h-64 bg-pink-light sm:min-h-[360px]">
                <Image
                  src={location.image}
                  alt={`${location.name} Pink Beauty location`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  {location.note}
                </p>
                <h3 className="mt-2 font-display text-3xl">{location.name}</h3>
                <p className="mt-3 flex gap-2 text-xs leading-5 text-black/45">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-pink" />
                  {location.address}
                </p>
                <div className="my-6 border-y border-black/5 py-5">
                  <h4 className="text-sm font-bold">
                    {locationFocus[index].title}
                  </h4>
                  <p className="mt-2 text-xs leading-6 text-black/50">
                    {locationFocus[index].text}
                  </p>
                </div>
                <Link
                  href={`/locations/${location.slug}`}
                  className="mt-auto inline-flex items-center gap-2 text-xs font-bold text-pink"
                >
                  Explore {location.name} <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
