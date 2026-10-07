import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BasketCheckout } from "@/components/checkout/basket-checkout";
import { getBranchCatalog } from "@/lib/catalog";
import { getBranchBySlug } from "@/lib/branches";

export const metadata: Metadata = { title: "Basket checkout", robots: { index: false, follow: false } };

export default async function BasketCheckoutPage({ params }: { params: Promise<{ branchSlug: string }> }) {
  const branch = getBranchBySlug((await params).branchSlug);
  if (!branch) notFound();
  const catalog = await getBranchCatalog(branch.slug);
  return <BasketCheckout branch={branch} catalog={catalog.map(({ handle, title, kind, variants }) => ({ handle, title, kind, variants }))} />;
}
