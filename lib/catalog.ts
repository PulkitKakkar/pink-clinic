import westStreetCatalog from "@/data/west-street-catalog.json";
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

const fallback = westStreetCatalog as CatalogItem[];

type SanityCatalogItem = {
  handle: string;
  title: string;
  description?: string;
  kind: CatalogItem["kind"];
  category?: string;
  images?: string[];
  variants?: CatalogVariant[];
  branchPrice?: number;
  branchPriceLabel?: string;
  active?: boolean;
};

export async function getBranchCatalog(branchSlug: string): Promise<CatalogItem[]> {
  if (branchSlug !== "reading-west-st") return [];
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "replace-me") return fallback;

  try {
    const overrides = await sanityClient.fetch<SanityCatalogItem[]>(`*[_type == "catalogItem" && count(branches[branch->slug.current == $branchSlug]) > 0]{
      "handle": slug.current,
      title,
      description,
      kind,
      category,
      "images": images[].asset->url,
      variants[]{name, price},
      "branchPrice": branches[branch->slug.current == $branchSlug][0].price,
      "branchPriceLabel": branches[branch->slug.current == $branchSlug][0].priceLabel,
      "active": active != false && branches[branch->slug.current == $branchSlug][0].available != false
    }`, { branchSlug }, { next: { revalidate: 60 } });
    if (!overrides.length) return fallback;
    const byHandle = new Map(overrides.map((item) => [item.handle, item]));
    const merged = fallback.flatMap((item) => {
      const override = byHandle.get(item.handle);
      if (!override) return [item];
      byHandle.delete(item.handle);
      if (override.active === false) return [];
      const variants = override.variants?.length ? override.variants : override.branchPrice != null ? [{ name: override.branchPriceLabel || "Standard", price: override.branchPrice }] : item.variants;
      return [{ ...item, ...override, tags: override.category ? [override.category] : item.tags, images: override.images?.length ? override.images : item.images, variants }];
    });
    return [...merged, ...[...byHandle.values()].filter((item) => item.active !== false).map((item) => ({ handle: item.handle, title: item.title, description: item.description || "", kind: item.kind, tags: item.category ? [item.category] : [], images: item.images || [], variants: item.variants || (item.branchPrice != null ? [{ name: item.branchPriceLabel || "Standard", price: item.branchPrice }] : []) }))];
  } catch {
    return fallback;
  }
}
