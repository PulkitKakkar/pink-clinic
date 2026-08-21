import type { BasketItem } from "@/lib/basket/types";

export type BasketCatalogMetadata = {
  handle: string;
  kind: "service" | "product" | "course";
  duration?: string;
};

export function getBookableBasketItems(
  items: BasketItem[],
  catalogItems: BasketCatalogMetadata[],
) {
  const metadata = new Map(catalogItems.map((item) => [item.handle, item]));
  return items.flatMap((item) => {
    const details = metadata.get(item.handle);
    if ((item.kind || details?.kind) !== "service") return [];
    return Array.from({ length: item.quantity }, () => ({
      item,
      durationMinutes:
        Number((item.duration || details?.duration)?.match(/\d+/)?.[0]) || 60,
    }));
  });
}
