import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Branch } from "@/lib/branches";
import { offers } from "@/lib/content";
import { formatTreatmentPrice, pricingProvider } from "@/lib/pricing";

export function BranchOffers({ branch }: { branch: Branch }) {
  return (
    <section className="section-shell bg-white">
      <div className="container-site">
        <div className="section-header">
          <p className="eyebrow">Offers at {branch.name}</p>
          <h2 className="section-title">Current offers</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {offers.map((offer) => {
            const servicePrice = offer.serviceSlug
              ? formatTreatmentPrice(pricingProvider.getTreatmentPrice(offer.serviceSlug, branch.id))
              : offer.price;
            const href = offer.serviceSlug
              ? `/treatments/${branch.slug}/${offer.serviceSlug}`
              : offer.href || `/contact?branchId=${branch.id}&type=offer`;

            return (
              <Link href={href} key={offer.id} className="group overflow-hidden rounded-2xl border border-black/5 bg-cream sm:rounded-[1.5rem]">
                <div className="relative aspect-[4/3] overflow-hidden bg-pink-light">
                  <Image src={offer.image} alt={offer.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[.2em] text-white">{offer.eyebrow}</p>
                </div>
                <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <h3 className="font-display text-2xl leading-none tracking-tight sm:text-3xl">{offer.title}</h3>
                    {servicePrice && <p className="mt-3 text-xs font-bold text-pink">{servicePrice}</p>}
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 transition group-hover:border-pink group-hover:bg-pink group-hover:text-white">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
