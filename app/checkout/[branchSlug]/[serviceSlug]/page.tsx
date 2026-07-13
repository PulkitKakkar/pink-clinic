import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentCheckoutMockup } from "@/components/checkout/payment-checkout-mockup";
import { branches, getBranchBySlug } from "@/lib/branches";
import { services } from "@/lib/content";
import { getBranchPaymentConfig } from "@/lib/payments/providers";
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
  const payment = getBranchPaymentConfig(branch.id);
  if (!payment || treatmentPrice?.price == null) notFound();

  return <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24"><PaymentCheckoutMockup branch={branch} service={service} price={treatmentPrice.price} payment={payment} /></main>;
}
