import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogCheckout } from "@/components/checkout/catalog-checkout";
import { getBranchBySlug } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Catalogue checkout", robots: { index: false, follow: false } };

export default async function CatalogCheckoutPage({ params }: { params: Promise<{ branchSlug: string; itemHandle: string }> }) {
  const { branchSlug, itemHandle } = await params;
  const branch = getBranchBySlug(branchSlug);
  if (!branch) notFound();

  const catalog = await getBranchCatalog(branch.slug);
  const item = catalog.find((entry) => entry.handle === decodeURIComponent(itemHandle));
  const variants = item?.variants.filter((variant) => variant.available !== false && Number.isFinite(variant.price) && variant.price > 0) || [];
  if (!item || item.merchantAvailability === "out_of_stock" || !variants.length) notFound();

  return <main className="min-h-screen bg-pink-light/30 pt-20 sm:pt-24"><CatalogCheckout branch={branch} item={item} returnHref={`/treatments/${branch.slug}?catalogCollection=${encodeURIComponent(item.tags[0] || "all")}#complete-catalogue`} /></main>;
}
