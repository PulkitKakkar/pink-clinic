import type { CatalogItem } from "@/lib/catalog";

const images = {
  academy: "/images/catalog-v2/academy-training.webp",
  skin: "/images/catalog-v2/advanced-skin-treatment.webp",
  consultation: "/images/catalog-v2/aesthetics-consultation.webp",
  brows: "/images/catalog-v2/brow-lash-services.webp",
  piercing: "/images/catalog-v2/ear-piercing.webp",
  facial: "/images/catalog-v2/facial-treatment.webp",
  hair: "/images/catalog-v2/hair-services.webp",
  laser: "/images/catalog-v2/laser-hair-removal.webp",
  makeup: "/images/catalog-v2/makeup-services.webp",
  massage: "/images/catalog-v2/massage-wellness.webp",
  nails: "/images/catalog-v2/nail-services.webp",
  threading: "/images/catalog-v2/threading-brows.webp",
  waxing: "/images/catalog-v2/waxing-services.webp",
} as const;

export function getProposedCatalogImage(item: CatalogItem) {
  if (item.kind === "product") return item.images[0] || images.facial;
  if (item.kind === "course") return images.academy;

  const text = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
  if (text.includes("ear piercing")) return images.piercing;
  if (/(manicure|pedicure|shellac|nail)/.test(text)) return images.nails;
  if (text.includes("makeup")) return images.makeup;
  if (/(massage|body scrub)/.test(text)) return images.massage;
  if (/(balayage|hair cut|hair colour|hair curl|hair spa|hair straighten|highlights|blow dry|roots colouring)/.test(text)) return images.hair;
  if (text.includes("laser hair")) return images.laser;
  if (text.includes("wax")) return images.waxing;
  if (text.includes("thread")) return images.threading;
  if (/(brow|eyelash|micro-blad|microblad|micro-shad|microshad|lip blush|micropigmentation|spmu)/.test(text)) return images.brows;
  if (/(injection|filler|jalupro|lemon bottle|iv drip|iv drop|vitamin|glutathione|myers cocktail)/.test(text)) return images.consultation;
  if (/(morpheus|micro.need|microderm|dermaplan|chemical peel|carbon peel|cosmelan|dermamelan|rejuvenation|eye firming)/.test(text)) return images.skin;
  return images.facial;
}

export function withProposedCatalogImage(item: CatalogItem): CatalogItem {
  return item.kind === "product" ? item : { ...item, images: [getProposedCatalogImage(item), ...item.images] };
}
