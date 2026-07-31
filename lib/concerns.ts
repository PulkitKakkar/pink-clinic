import type { CatalogItem } from "@/lib/catalog";

export type TreatmentConcern = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  terms: string[];
  goals: string[];
};

export const treatmentConcerns: TreatmentConcern[] = [
  { slug: "lines-wrinkles", name: "Lines and wrinkle treatments", shortName: "Lines & wrinkles", description: "Consultation-led options designed to soften the appearance of lines while keeping results considered and personal.", terms: ["anti wrinkle", "jalupro"], goals: ["Soften visible lines", "Maintain natural expression", "Refresh tired-looking skin"] },
  { slug: "pigmentation", name: "Pigmentation treatments", shortName: "Pigmentation", description: "Personalised skin plans for uneven tone, visible sun damage and areas of pigmentation.", terms: ["pigment", "cosmelan", "dermamelan", "carbon peel"], goals: ["More even-looking tone", "Brighter complexion", "Target visible sun damage"] },
  { slug: "skin-boosters", name: "Skin booster treatments", shortName: "Skin boosters", description: "Hydration and rejuvenation treatments selected around your skin quality, texture and radiance goals.", terms: ["jalupro", "morpheus8", "skin rejuvenation", "hydrafacial"], goals: ["Improve hydration", "Support skin quality", "Restore visible radiance"] },
  { slug: "acne-texture", name: "Acne and skin texture treatments", shortName: "Acne & texture", description: "A consultation-led approach to congestion, post-acne marks, scarring and uneven skin texture.", terms: ["acne", "scar", "carbon peel", "morpheus8", "advanced skincare"], goals: ["Refine uneven texture", "Support clearer-looking skin", "Target post-acne marks"] },
  { slug: "unwanted-hair", name: "Unwanted hair treatments", shortName: "Unwanted hair", description: "Laser, waxing and threading options for smoother skin across face and body areas.", terms: ["laser hair removal", "waxing", "threading"], goals: ["Longer-lasting smoothness", "Treat face or body areas", "Choose a plan around your routine"] },
  { slug: "body-contouring", name: "Body contouring treatments", shortName: "Body contouring", description: "Consultation-led treatments for targeted body goals, selected only after an individual suitability assessment.", terms: ["lemon bottle", "body treatment", "body bleaching"], goals: ["Discuss targeted areas", "Explore non-surgical options", "Build a personalised plan"] },
];

export function getConcernBySlug(slug: string) {
  return treatmentConcerns.find((concern) => concern.slug === slug);
}

export function matchesConcern(item: Pick<CatalogItem, "title" | "tags" | "concerns">, concern: TreatmentConcern | string) {
  const selected = typeof concern === "string" ? treatmentConcerns.find((entry) => entry.slug === concern || entry.name === concern || entry.shortName === concern) : concern;
  if (!selected) return false;
  if (item.concerns?.includes(selected.slug)) return true;
  const searchable = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
  return selected.terms.some((term) => searchable.includes(term));
}

const collectionAliases: Record<string, string> = {
  "black friday sale": "Black Friday Sale",
  "gift card": "Gift Cards",
  "gift cards": "Gift Cards",
};

export function normalizeCollectionName(name: string) {
  const trimmed = name.trim();
  return collectionAliases[trimmed.toLowerCase()] || trimmed;
}

export function normalizeCollections(names: string[]) {
  return [...new Set(names.map(normalizeCollectionName).filter(Boolean))];
}
