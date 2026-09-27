import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StripeTreatmentCheckout } from "@/components/checkout/stripe-treatment-checkout";
import { branches, getBranchBySlug } from "@/lib/branches";
import { services } from "@/lib/content";
import { pricingProvider } from "@/lib/pricing";

export const metadata: Metadata = { title: "Checkout preview", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return branches.flatMap((branch) => services.map((service) => ({ branchSlug: branch.slug, serviceSlug: service.slug })));
}

export default async function CheckoutPreviewPage({ params }: { params: Promise<{ branchSlug: string; serviceSlug: string }> }) {
  const { branchSlug, serviceSlug } = await params;
  const branch = getBranchBySlug(branchSlug);
  const service = services.find((item) => item.slug === serviceSlug);
  if (!branch || !service) notFound();

  const treatmentPrice = pricingProvider.getTreatmentPrice(service.id, branch.id);
  if (treatmentPrice?.price == null) notFound();

  return <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24"><StripeTreatmentCheckout branch={branch} service={service} price={treatmentPrice.price} /></main>;
}
