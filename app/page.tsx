import type { Metadata } from "next";
import { AppointmentCta } from "@/components/sections/cta";
import { AcademyShowcase } from "@/components/sections/academy-showcase";
import { Hero } from "@/components/sections/hero";
import { LocationComparison } from "@/components/sections/location-comparison";
import { OffersCarousel } from "@/components/sections/offers-carousel";
import { Reviews } from "@/components/sections/reviews";
import { TreatmentConcerns } from "@/components/sections/treatment-concerns";
import { TreatmentFinderPrompt } from "@/components/sections/treatment-finder-prompt";
import { locations, offers } from "@/lib/content";
import { getCombinedCatalog } from "@/lib/catalog";
import { matchesConcern, treatmentConcerns } from "@/lib/concerns";

export const metadata: Metadata = {
  title: "Skin & aesthetic treatments in Reading",
  description:
    "Explore anti-wrinkle, pigmentation, skin booster, acne, hair-removal and body treatments at Pink Beauty's two Reading clinics.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const fullCatalog = await getCombinedCatalog();
  const catalog = fullCatalog.filter(
    (item) => item.kind === "service",
  );
  const courses = fullCatalog.filter((item) => item.kind === "course");
  const popularHandles = [
    "hydrafacial",
    "anti-wrinkle-injections",
    "skin-rejuvenation-treatment",
    "full-body-free-face-laser-hair-removal",
  ];
  const popularTreatments = popularHandles
    .map((handle) => catalog.find((item) => item.handle === handle))
    .filter((item): item is (typeof catalog)[number] => Boolean(item));
  const concerns = treatmentConcerns.map((concern) => ({
    ...concern,
    image: catalog.find(
      (item) => matchesConcern(item, concern) && item.images[0],
    )?.images[0],
  }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Pink Beauty Salon & Academy",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk",
    telephone: locations[0].phone,
    priceRange: "££",
    knowsAbout: treatmentConcerns.map((concern) => concern.name),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Skin and aesthetic treatments",
      itemListElement: treatmentConcerns.map((concern) => ({
        "@type": "OfferCatalog",
        name: concern.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk"}/concerns/${concern.slug}`,
      })),
    },
    address: locations.map((location) => ({
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Reading",
      addressCountry: "GB",
    })),
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero />
      <TreatmentConcerns concerns={concerns} popularTreatments={popularTreatments} />
      <TreatmentFinderPrompt />
      <AcademyShowcase courses={courses} />
      <Reviews />
      <OffersCarousel offers={offers} />
      <LocationComparison />
      <AppointmentCta />
    </main>
  );
}
