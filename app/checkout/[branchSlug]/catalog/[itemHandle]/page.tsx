import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentCheckoutMockup } from "@/components/checkout/payment-checkout-mockup";
import { getBranchBySlug } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";
import { getBranchPaymentConfig } from "@/lib/payments/providers";

export const metadata: Metadata = { title: "Catalogue checkout", robots: { index: false, follow: false } };

export default async function CatalogCheckoutPage({ params }: { params: Promise<{ branchSlug: string; itemHandle: string }> }) {
  const { branchSlug, itemHandle } = await params;
  const branch = getBranchBySlug(branchSlug);
  if (!branch) notFound();

  const catalog = await getBranchCatalog(branch.slug);
  const item = catalog.find((entry) => entry.handle === decodeURIComponent(itemHandle));
  const payment = getBranchPaymentConfig(branch.id);
  const variants = item?.variants.filter((variant) => Number.isFinite(variant.price) && variant.price > 0) || [];
  if (!item || !payment || !variants.length) notFound();

  return <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24"><PaymentCheckoutMockup branch={branch} service={{ title: item.title, slug: item.handle }} price={variants[0].price} variants={variants.map(({ name, price }) => ({ name, price }))} payment={payment} returnHref={`/treatments/${branch.slug}?catalogCollection=${encodeURIComponent(item.tags[0] || "all")}#complete-catalogue`} returnLabel="Back to products & services" /></main>;
}
