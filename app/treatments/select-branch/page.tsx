import type { Metadata } from "next";
import { BranchSelector } from "@/components/branch-selector";
import { PageHero } from "@/components/page-hero";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Choose Your Treatment Branch",
  description: "Choose your Pink Beauty Salon branch to see accurate treatment pricing and availability.",
};

export default async function SelectBranchPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const requestedService = (await searchParams).service;
  const serviceSlug = services.some((service) => service.slug === requestedService) ? requestedService : undefined;
  return <main><PageHero eyebrow="Treatments · Step one" title="Choose your Pink branch." copy="Select where you would like to visit to see accurate pricing and availability." image="/images/watlington.jpg" /><section className="bg-cream py-8 sm:py-28"><div className="container-site"><BranchSelector branches={branches} serviceSlug={serviceSlug} /></div></section></main>;
}
