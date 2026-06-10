import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Treatments } from "@/components/sections/treatments";
import { AppointmentCta } from "@/components/sections/cta";

export const metadata: Metadata = { title: "Beauty & Aesthetic Treatments Reading", description: "Discover advanced beauty, laser and aesthetic treatments at Pink Beauty Salon in Reading." };

export default function ServicesPage() {
  return <main><PageHero eyebrow="Beauty · Laser · Aesthetics" title="Treatments made personal." copy="From glow-giving facials to advanced laser and aesthetics, every Pink treatment begins with you." image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=2200&q=90" /><Treatments /><AppointmentCta /></main>;
}
