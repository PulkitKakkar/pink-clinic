import { AppointmentCta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { InstagramFeed } from "@/components/sections/instagram";
import { OffersCarousel } from "@/components/sections/offers-carousel";
import { Reviews } from "@/components/sections/reviews";
import { ServicesShowcase } from "@/components/sections/services-showcase";
import { Team } from "@/components/sections/team";
import { WhyPink } from "@/components/sections/why-pink";
import { locations, offers } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const schema = { "@context": "https://schema.org", "@type": "BeautySalon", name: "Pink Beauty Salon & Academy", url: process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk", telephone: locations[0].phone, priceRange: "££", address: locations.map(location => ({ "@type": "PostalAddress", streetAddress: location.address, addressLocality: "Reading", addressCountry: "GB" })) };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><Hero /><OffersCarousel offers={offers} /><WhyPink /><Team /><ServicesShowcase /><Reviews /><InstagramFeed /><AppointmentCta /></main>;
}
import type { Metadata } from "next";
