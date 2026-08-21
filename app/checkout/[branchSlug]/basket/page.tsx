import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BasketCheckout } from "@/components/checkout/basket-checkout";
import { getBranchBySlug } from "@/lib/branches";
import { getBranchPaymentConfig } from "@/lib/payments/providers";
import { getBranchCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Basket checkout", robots: { index: false, follow: false } };

export default async function BasketCheckoutPage({ params }: { params: Promise<{ branchSlug: string }> }) {
  const branch = getBranchBySlug((await params).branchSlug);
  const payment = branch ? getBranchPaymentConfig(branch.id) : undefined;
  if (!branch || !payment) notFound();
  const catalog = await getBranchCatalog(branch.slug);
  return <BasketCheckout branch={branch} payment={payment} catalogItems={catalog.map(({ handle, kind, duration }) => ({ handle, kind, duration }))} />;
}
