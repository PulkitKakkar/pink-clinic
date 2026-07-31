import westStreetCatalog from "@/data/west-street-catalog.json";
import watlingtonStreetCatalog from "@/data/watlington-street-catalog.json";
import { sanityClient } from "@/lib/sanity/client";
import { branches, type Branch } from "@/lib/branches";
import { normalizeCollections } from "@/lib/concerns";

export type CatalogVariant = { name: string; price: number; compareAtPrice?: number | null; sku?: string | null };
export type CatalogItem = {
  handle: string;
  title: string;
  description: string;
  kind: "service" | "product" | "course";
  tags: string[];
  images: string[];
  variants: CatalogVariant[];
  concerns?: string[];
  expectedResults?: string[];
  treatmentAreas?: string[];
  duration?: string;
  downtime?: string;
  sessions?: string;
  faqs?: { question: string; answer: string }[];
  beforeAfter?: { before: string; after: string; alt?: string }[];
};

export type BranchCatalogItem = { branch: Branch; item: CatalogItem };
export type CombinedCatalogItem = CatalogItem & {
  branchItems: BranchCatalogItem[];
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
  concerns?: string[];
  expectedResults?: string[];
  treatmentAreas?: string[];
  duration?: string;
  downtime?: string;
  sessions?: string;
  faqs?: { question: string; answer: string }[];
  beforeAfter?: { before: string; after: string; alt?: string }[];
};

function normalizeItem(item: CatalogItem): CatalogItem {
  return { ...item, tags: normalizeCollections(item.tags || []) };
}

export async function getBranchCatalog(branchSlug: string): Promise<CatalogItem[]> {
  const branchFallback = fallbackByBranch[branchSlug] || [];
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "replace-me") return branchFallback.map(normalizeItem);

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
      "active": active != false && branches[branch->slug.current == $branchSlug][0].available != false,
      concerns,
      expectedResults,
      treatmentAreas,
      duration,
      downtime,
      sessions,
      faqs[]{question, answer},
      "beforeAfter": beforeAfter[consentConfirmed == true]{"before": before.asset->url, "after": after.asset->url, alt}
    }`, { branchSlug }, { next: { revalidate: 60 } });
    if (!overrides.length) return branchFallback.map(normalizeItem);
    const byHandle = new Map(overrides.map((item) => [item.handle, item]));
    const merged = branchFallback.flatMap((item) => {
      const override = byHandle.get(item.handle);
      if (!override) return [item];
      byHandle.delete(item.handle);
      if (override.active === false) return [];
      const variants = override.branchVariants?.length ? override.branchVariants : override.branchPrice != null ? [{ name: override.branchPriceLabel || "Standard", price: override.branchPrice, compareAtPrice: override.branchCompareAtPrice }] : override.variants?.length ? override.variants : item.variants;
      const collectionTitles = override.collectionTitles || [];
      return [normalizeItem({ ...item, ...override, tags: collectionTitles.length ? collectionTitles : override.category ? [override.category] : item.tags, images: override.images?.length ? override.images : item.images, variants })];
    });
    return [...merged, ...[...byHandle.values()].filter((item) => item.active !== false).map((item) => normalizeItem({ handle: item.handle, title: item.title, description: item.description || "", kind: item.kind, tags: item.collectionTitles?.length ? item.collectionTitles : item.category ? [item.category] : [], images: item.images || [], variants: item.branchVariants?.length ? item.branchVariants : item.branchPrice != null ? [{ name: item.branchPriceLabel || "Standard", price: item.branchPrice, compareAtPrice: item.branchCompareAtPrice }] : item.variants || [], concerns: item.concerns, expectedResults: item.expectedResults, treatmentAreas: item.treatmentAreas, duration: item.duration, downtime: item.downtime, sessions: item.sessions, faqs: item.faqs, beforeAfter: item.beforeAfter }))];
  } catch {
    return branchFallback;
  }
}

export async function getCombinedCatalog(): Promise<CombinedCatalogItem[]> {
  const branchCatalogs = await Promise.all(
    branches.map(async (branch) => ({
      branch,
      items: await getBranchCatalog(branch.slug),
    })),
  );
  const combined = new Map<string, CombinedCatalogItem>();
  for (const { branch, items } of branchCatalogs) {
    for (const item of items) {
      const current = combined.get(item.handle);
      if (!current) {
        combined.set(item.handle, {
          ...item,
          branchItems: [{ branch, item }],
        });
        continue;
      }
      current.branchItems.push({ branch, item });
      current.tags = normalizeCollections([...current.tags, ...item.tags]);
      current.concerns = [...new Set([...(current.concerns || []), ...(item.concerns || [])])];
      current.images = current.images.length ? current.images : item.images;
      current.variants = [...current.variants, ...item.variants];
    }
  }
  return [...combined.values()].sort((a, b) => a.title.localeCompare(b.title));
}
