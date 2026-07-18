import westStreetCatalog from "@/data/west-street-catalog.json";
import watlingtonStreetCatalog from "@/data/watlington-street-catalog.json";
import { sanityClient } from "@/lib/sanity/client";

export type CatalogVariant = { name: string; price: number; compareAtPrice?: number | null; sku?: string | null };
export type CatalogItem = {
  handle: string;
  title: string;
  description: string;
  kind: "service" | "product" | "course";
  tags: string[];
  images: string[];
  variants: CatalogVariant[];
};

const fallbackByBranch: Record<string, CatalogItem[]> = {
  "reading-west-st": westStreetCatalog as CatalogItem[],
  "reading-watlington-st": watlingtonStreetCatalog as CatalogItem[],
};

type SanityCatalogItem = {
  handle: string;
  title: string;
  description?: string;
  kind: CatalogItem["kind"];
  category?: string;
  collectionTitles?: string[];
  images?: string[];
  variants?: CatalogVariant[];
  branchPrice?: number;
  branchCompareAtPrice?: number;
  branchPriceLabel?: string;
  branchVariants?: CatalogVariant[];
  active?: boolean;
};

export async function getBranchCatalog(branchSlug: string): Promise<CatalogItem[]> {
  const branchFallback = fallbackByBranch[branchSlug] || [];
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "replace-me") return branchFallback;

  try {
    const overrides = await sanityClient.fetch<SanityCatalogItem[]>(`*[_type == "catalogItem" && count(branches[branch->slug.current == $branchSlug]) > 0]{
      "handle": slug.current,
      title,
      description,
      kind,
      category,
      "collectionTitles": collections[]->title,
      "images": images[].asset->url,
      variants[]{name, price, compareAtPrice},
      "branchPrice": branches[branch->slug.current == $branchSlug][0].price,
      "branchCompareAtPrice": branches[branch->slug.current == $branchSlug][0].compareAtPrice,
      "branchPriceLabel": branches[branch->slug.current == $branchSlug][0].priceLabel,
      "branchVariants": branches[branch->slug.current == $branchSlug][0].variants[]{name, price, compareAtPrice},
      "active": active != false && branches[branch->slug.current == $branchSlug][0].available != false
    }`, { branchSlug }, { next: { revalidate: 60 } });
    if (!overrides.length) return branchFallback;
    const byHandle = new Map(overrides.map((item) => [item.handle, item]));
    const merged = branchFallback.flatMap((item) => {
      const override = byHandle.get(item.handle);
      if (!override) return [item];
      byHandle.delete(item.handle);
      if (override.active === false) return [];
      const variants = override.branchVariants?.length ? override.branchVariants : override.branchPrice != null ? [{ name: override.branchPriceLabel || "Standard", price: override.branchPrice, compareAtPrice: override.branchCompareAtPrice }] : override.variants?.length ? override.variants : item.variants;
      const collectionTitles = override.collectionTitles || [];
      return [{ ...item, ...override, tags: collectionTitles.length ? collectionTitles : override.category ? [override.category] : item.tags, images: override.images?.length ? override.images : item.images, variants }];
    });
    return [...merged, ...[...byHandle.values()].filter((item) => item.active !== false).map((item) => ({ handle: item.handle, title: item.title, description: item.description || "", kind: item.kind, tags: item.collectionTitles?.length ? item.collectionTitles : item.category ? [item.category] : [], images: item.images || [], variants: item.branchVariants?.length ? item.branchVariants : item.branchPrice != null ? [{ name: item.branchPriceLabel || "Standard", price: item.branchPrice, compareAtPrice: item.branchCompareAtPrice }] : item.variants || [] }))];
  } catch {
    return branchFallback;
  }
}
