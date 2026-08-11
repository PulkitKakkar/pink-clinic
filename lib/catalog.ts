import westStreetCatalog from "@/data/west-street-catalog.json";
import watlingtonStreetCatalog from "@/data/watlington-street-catalog.json";
import { sanityClient } from "@/lib/sanity/client";
import { branches, type Branch } from "@/lib/branches";
import { normalizeCollections } from "@/lib/concerns";

export type CatalogVariant = {
  name: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  gtin?: string | null;
  mpn?: string | null;
};
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
  brand?: string;
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  merchantCondition?: "new" | "refurbished" | "used";
  merchantAvailability?: "in_stock" | "out_of_stock" | "preorder" | "backorder";
};

export type BranchCatalogItem = { branch: Branch; item: CatalogItem };
export type CombinedCatalogItem = CatalogItem & {
  branchItems: BranchCatalogItem[];
};

const pinkCatalogueUpdates: CatalogItem[] = [
  {
    handle: "small-tattoo-removal",
    title: "Small Tattoo Removal",
    description: "Consultation-led laser tattoo removal for a small tattoo. Suitability, expected clearance, risks and the treatment schedule are confirmed before treatment.",
    kind: "service",
    tags: ["Tattoo Removal", "Aesthetic Treatments", "Clinic Services"],
    images: [],
    variants: [
      { name: "1 Session", price: 75 },
      { name: "6 Sessions", price: 375 },
    ],
  },
  {
    handle: "medium-tattoo-removal",
    title: "Medium Tattoo Removal",
    description: "Consultation-led laser tattoo removal for a medium tattoo. Suitability, expected clearance, risks and the treatment schedule are confirmed before treatment.",
    kind: "service",
    tags: ["Tattoo Removal", "Aesthetic Treatments", "Clinic Services"],
    images: [],
    variants: [
      { name: "1 Session", price: 100 },
      { name: "6 Sessions", price: 500 },
    ],
  },
  {
    handle: "large-tattoo-removal",
    title: "Large Tattoo Removal",
    description: "Consultation-led laser tattoo removal for a large tattoo. Suitability, expected clearance, risks and the treatment schedule are confirmed before treatment.",
    kind: "service",
    tags: ["Tattoo Removal", "Aesthetic Treatments", "Clinic Services"],
    images: [],
    variants: [
      { name: "1 Session", price: 150 },
      { name: "6 Sessions", price: 750 },
    ],
  },
  ...[
    ["jalupro-hydro", "Jalupro Hydro", 200],
    ["plinest", "Plinest", 200],
    ["seventy-hyal", "Seventy Hyal", 200],
    ["profhilo", "Profhilo", 250],
  ].map(([handle, title, price]) => ({
    handle: handle as string,
    title: title as string,
    description: `${title} is a consultation-led injectable skin booster intended to support skin hydration and quality. Suitability, risks, aftercare and the treatment plan are discussed before treatment.`,
    kind: "service" as const,
    tags: ["Skin Boosters", "Aesthetic Treatments", "Clinic Services"],
    images: [],
    variants: [{ name: "1 Session", price: price as number }],
  })),
  ...[
    ["jalupro-young-eye", "Jalupro Young Eye", 180],
    ["lumi-eyes", "Lumi Eyes", 150],
    ["plinest-eye", "Plinest Eye", 180],
  ].map(([handle, title, price]) => ({
    handle: handle as string,
    title: title as string,
    description: `${title} is a consultation-led injectable treatment for the eye area. Suitability, realistic outcomes, risks and aftercare are discussed before treatment.`,
    kind: "service" as const,
    tags: ["Skin Boosters", "Eye Treatments", "Aesthetic Treatments", "Clinic Services"],
    images: [],
    variants: [{ name: "1 Session", price: price as number }],
  })),
];

function withPinkCatalogueUpdates(items: CatalogItem[]): CatalogItem[] {
  const updatesByHandle = new Map(
    pinkCatalogueUpdates.map((item) => [item.handle, item]),
  );
  return [
    ...items.map((item) => {
      if (item.handle !== "jalupro") return item;
      return {
        ...item,
        tags: ["Skin Boosters", "Aesthetic Treatments", "Clinic Services"],
        variants: [{ name: "1 Session", price: 150 }],
      };
    }),
    ...updatesByHandle.values(),
  ];
}

const fallbackByBranch: Record<string, CatalogItem[]> = {
  "reading-west-st": withPinkCatalogueUpdates(westStreetCatalog as CatalogItem[]),
  "reading-watlington-st": withPinkCatalogueUpdates(watlingtonStreetCatalog as CatalogItem[]),
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
  brand?: string;
  gtin?: string;
  mpn?: string;
  googleProductCategory?: string;
  merchantCondition?: CatalogItem["merchantCondition"];
  merchantAvailability?: CatalogItem["merchantAvailability"];
};

const catalogueContent: Record<string, { title?: string; description: string; brand?: string }> = {
  "centre-brow": { title: "Centre Brow Threading or Waxing", description: "A precise hair-removal service for the area between the brows, helping create a cleaner, more defined brow shape." },
  "chicks-threading": { title: "Men's Cheeks Threading or Waxing", description: "Targeted threading or waxing for unwanted hair on the cheeks, with the method selected to suit the skin and desired finish." },
  "mens-ears-laser-hair-removal": { title: "Men's Ear Laser Hair Removal", description: "Consultation-led laser hair removal for unwanted hair around the external ear area, with a patch test and treatment plan confirmed before starting." },
  "eyebrow-threading-1": { title: "Men's Eyebrow Threading or Waxing", description: "Professional eyebrow shaping for men using threading or waxing to tidy stray hair while maintaining a natural-looking brow shape." },
  "mens-front-back-neck-laser-hair-removal": { title: "Men's Front and Back Neck Laser Hair Removal", description: "Laser hair removal for the front and back of the neck, planned around hair growth, skin suitability and the result agreed during consultation." },
  "mens-underarm-laser-hair-removal": { title: "Men's Underarm Laser Hair Removal", description: "A consultation-led course of laser hair removal for unwanted underarm hair, with suitability and patch testing confirmed before treatment." },
  "advanced-make-up-course": { title: "Advanced Make-Up Course", description: "Practical advanced make-up training covering professional techniques, application and client-ready skills, with dates and entry requirements confirmed before enrolment." },
  "beauty-therapy-diploma": { title: "Beauty Therapy Diploma", description: "Structured beauty therapy diploma training combining theory, practical learning and assessment to support progression into professional beauty services." },
  "facial-and-skincare-course": { title: "Facial and Skincare Course", description: "Practical facial and skincare training covering consultation, skin analysis, treatment steps, hygiene and appropriate client aftercare." },
  "female-intimate-waxing-course": { title: "Female Intimate Waxing Course", description: "Professional intimate waxing training focused on consultation, hygiene, safe technique, client comfort and aftercare in a supervised academy setting." },
  "gel-manicure-and-pedicure": { title: "Gel Manicure and Pedicure Course", description: "Hands-on gel manicure and pedicure training covering preparation, application, finishing, removal and client aftercare." },
  "ultimate-brow-masterclass-microblading-machine-ombre-powder-combination-course": { title: "Ultimate Brow Masterclass", description: "Advanced brow training covering microblading, machine ombré, powder and combination techniques, with prerequisites and assessment confirmed before enrolment." },
  "ultimate-spmu-course-machine-ombre-powder-brows-lip-blush-lip-liner": { title: "Ultimate SPMU Brows and Lips Course", description: "Semi-permanent make-up training covering machine ombré and powder brows, lip blush and lip liner techniques in a structured practical course." },
  "waxing-course": { title: "Professional Waxing Course", description: "Practical waxing training covering consultation, preparation, safe hair-removal technique, hygiene and client aftercare for common treatment areas." },
};

const dermalogicaDescriptions: Record<string, string> = {
  "active-moist-moisturiser-50ml": "Dermalogica Active Moist is a lightweight 50ml moisturiser designed to hydrate without a heavy finish. Check ingredients and follow the packaging directions before use.",
  "breakout-clearing-foaming-wash-177ml": "Dermalogica Breakout Clearing Foaming Wash is a 177ml cleanser for blemish-prone skin. Use only as directed and check the ingredient list for sensitivities.",
  "daily-microfoliant-exfoliator-74g": "Dermalogica Daily Microfoliant is a 74g powder exfoliator designed to support smoother, brighter-looking skin when used according to the packaging instructions.",
  "dynamic-skin-recovery-spf50-moisturiser-50ml": "Dermalogica Dynamic Skin Recovery SPF50 is a 50ml daily moisturiser with broad-spectrum sun protection. Apply and reapply according to the product directions.",
  "intensive-moisture-balance-moisturiser-50ml": "Dermalogica Intensive Moisture Balance is a 50ml moisturiser created to support dry skin. Review the ingredients and use as directed on the packaging.",
  "multi-active-toner-250ml": "Dermalogica Multi-Active Toner is a 250ml facial toner designed to refresh and prepare skin for moisturiser. Use according to the manufacturer’s directions.",
  "precleanse-cleansing-oil-150ml": "Dermalogica PreCleanse is a 150ml cleansing oil designed to dissolve make-up, sunscreen and excess oil before a second cleanse. Use as directed.",
  "skin-smoothing-cream-moisturiser-50ml": "Dermalogica Skin Smoothing Cream is a 50ml moisturiser designed to support lasting hydration. Check ingredients and follow the packaging directions.",
  "special-cleansing-gel-250ml": "Dermalogica Special Cleansing Gel is a 250ml soap-free foaming cleanser for daily use. Follow the packaging instructions and avoid use if unsuitable for your skin.",
  "ultracalming-cleanser-250ml": "Dermalogica UltraCalming Cleanser is a 250ml gentle cleanser developed for sensitised skin. Review the ingredient list and use according to the packaging directions.",
};

for (const [handle, description] of Object.entries(dermalogicaDescriptions)) {
  catalogueContent[handle] = { description, brand: "Dermalogica" };
}

catalogueContent["pink-beauty-salon-and-academy-gift-card"] = { title: "Pink Beauty Salon and Academy Gift Card", description: "A Pink Beauty gift card for eligible salon or academy purchases. Confirm redemption, expiry and location terms before purchasing.", brand: "Pink Beauty" };
catalogueContent["pink-beauty-aesthetic-clinic-and-academy-gift-card"] = { title: "Pink Beauty Aesthetic Clinic and Academy Gift Card", description: "A Pink Beauty gift card for eligible clinic or academy purchases. Confirm redemption, expiry, treatment suitability and location terms before purchasing.", brand: "Pink Beauty" };

const catalogueConcernAssignments: Record<string, string[]> = {
  "anti-wrinkle-fillers": ["lines-wrinkles"],
  "anti-wrinkle-injections": ["lines-wrinkles"],
  jalupro: ["lines-wrinkles", "skin-boosters"],
  "jalupro-hydro": ["lines-wrinkles", "skin-boosters"],
  plinest: ["lines-wrinkles", "skin-boosters"],
  "seventy-hyal": ["lines-wrinkles", "skin-boosters"],
  profhilo: ["lines-wrinkles", "skin-boosters"],
  "jalupro-young-eye": ["lines-wrinkles", "skin-boosters"],
  "lumi-eyes": ["lines-wrinkles", "skin-boosters"],
  "plinest-eye": ["lines-wrinkles", "skin-boosters"],
  "cosmelan-pigmentation-peel": ["pigmentation"],
  "dermamelan-intimate-area": ["pigmentation"],
  "skin-brightening-facial": ["pigmentation", "skin-boosters"],
  "chemical-peel": ["pigmentation", "skin-boosters", "acne-texture"],
  hydrafacial: ["skin-boosters", "acne-texture"],
  "luxury-hydrafacial-buy-1-get-2nd-half-price": ["skin-boosters"],
  "luxury-dermaplaning": ["skin-boosters"],
  "micro-needling": ["skin-boosters", "acne-texture"],
  "micro-needling-with-prp": ["skin-boosters", "acne-texture"],
  microdermabrasion: ["skin-boosters", "acne-texture"],
  "eyes-morpheus8": ["lines-wrinkles", "skin-boosters"],
  "full-face-neck-morpheus8": [
    "lines-wrinkles",
    "skin-boosters",
    "acne-texture",
  ],
  "skin-rejuvenation-treatment": ["skin-boosters", "acne-texture"],
  "medibac-facial": ["acne-texture"],
  "carbon-peel-facial": ["acne-texture"],
  "body-morpheus8": ["body-contouring"],
};

function assignedConcerns(item: CatalogItem): string[] {
  if (item.concerns) return item.concerns;
  const assigned = catalogueConcernAssignments[item.handle];
  if (assigned) return assigned;
  if (
    item.tags.some((tag) =>
      [
        "Laser Hair Removal",
        "Laser Hair Removal Men",
        "Laser Hair Removal Women",
        "Waxing",
        "Hot Waxing",
        "Threading",
      ].includes(tag),
    )
  ) {
    return ["unwanted-hair"];
  }
  if (
    item.tags.some((tag) =>
      ["IV Drips", "Vitamin IM Injections"].includes(tag),
    )
  ) {
    return ["wellness-vitamins"];
  }
  return [];
}

function normalizeItem(item: CatalogItem): CatalogItem {
  const content = catalogueContent[item.handle];
  const handle =
    item.handle === "glutathione-and-vitamin-c-iv-drip-1"
      ? "glutathione-and-vitamin-c-iv-drip"
      : item.handle;
  return {
    ...item,
    handle,
    ...(content?.title && !item.description?.trim() ? { title: content.title } : {}),
    ...(content?.description && !item.description?.trim() ? { description: content.description } : {}),
    ...(content?.brand && !item.brand ? { brand: content.brand } : {}),
    tags: normalizeCollections(item.tags || []),
    concerns: assignedConcerns(item),
  };
}

const lemonBottleAreas: Record<string, string> = {
  "lemon-bottle-back": "Back",
  "lemon-bottle-double-chin": "Double chin",
  "lemon-bottle-double-chin-jawline": "Double chin and jawline",
  "lemon-bottle-love-handles": "Love handles",
  "lemon-bottle-upper-arms": "Upper arms",
  "lemon-bottle-upper-or-lower-stomach": "Upper or lower stomach",
};

function consolidateLemonBottle(items: CatalogItem[]): CatalogItem[] {
  const entries = items.filter((item) => item.handle in lemonBottleAreas);
  if (!entries.length) return items;
  const firstHandle = entries[0].handle;
  const consolidated: CatalogItem = {
    ...entries[0],
    handle: "lemon-bottle",
    title: "Lemon Bottle Targeted Body Treatment",
    description:
      "A consultation-led injectable body treatment for selected face or body areas. Choose the treatment area and session option below; suitability, realistic limitations, risks and alternatives are discussed before treatment.",
    tags: normalizeCollections(entries.flatMap((item) => item.tags)),
    images: entries[0].images[0] ? [entries[0].images[0]] : [],
    variants: entries.flatMap((item) =>
      item.variants.map((variant) => ({
        ...variant,
        name: `${lemonBottleAreas[item.handle]} · ${variant.name.replace(/\b3 Session\b/i, "3 sessions").replace(/\b1 Session\b/i, "1 session")}`,
      })),
    ),
    concerns: [
      ...new Set([
        "body-contouring",
        ...entries.flatMap((item) => item.concerns || []),
      ]),
    ],
    expectedResults: [
      "A treatment plan tailored to the assessed cosmetic goal",
      "Possible change in the appearance of the selected area",
    ],
    treatmentAreas: Object.values(lemonBottleAreas),
    duration: "Usually 30–60 minutes, depending on the selected area",
    downtime: "Swelling, tenderness or bruising may occur; individual response varies",
    sessions: "Choose one or three sessions; the final plan is confirmed during consultation",
  };
  return items.flatMap((item) => {
    if (!(item.handle in lemonBottleAreas)) return [item];
    return item.handle === firstHandle ? [consolidated] : [];
  });
}

function prepareCatalog(items: CatalogItem[]) {
  return consolidateLemonBottle(items.map(normalizeItem));
}

export async function getBranchCatalog(
  branchSlug: string,
): Promise<CatalogItem[]> {
  const branchFallback = fallbackByBranch[branchSlug] || [];
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "replace-me")
    return prepareCatalog(branchFallback);

  try {
    const overrides = await sanityClient.fetch<SanityCatalogItem[]>(
      `*[_type == "catalogItem" && count(branches[branch->slug.current == $branchSlug]) > 0]{
      "handle": slug.current,
      title,
      description,
      kind,
      category,
      "collectionTitles": collections[]->title,
      "images": images[].asset->url,
      variants[]{name, price, compareAtPrice, sku, gtin, mpn},
      "branchPrice": branches[branch->slug.current == $branchSlug][0].price,
      "branchCompareAtPrice": branches[branch->slug.current == $branchSlug][0].compareAtPrice,
      "branchPriceLabel": branches[branch->slug.current == $branchSlug][0].priceLabel,
      "branchVariants": branches[branch->slug.current == $branchSlug][0].variants[]{name, price, compareAtPrice, sku, gtin, mpn},
      "merchantAvailability": branches[branch->slug.current == $branchSlug][0].stockStatus,
      "active": active != false && branches[branch->slug.current == $branchSlug][0].available != false,
      concerns,
      expectedResults,
      treatmentAreas,
      duration,
      downtime,
      sessions,
      brand,
      gtin,
      mpn,
      googleProductCategory,
      merchantCondition,
      faqs[]{question, answer},
      "beforeAfter": beforeAfter[consentConfirmed == true]{"before": before.asset->url, "after": after.asset->url, alt}
    }`,
      { branchSlug },
      { next: { revalidate: 60 } },
    );
    if (!overrides.length) return prepareCatalog(branchFallback);
    const byHandle = new Map(overrides.map((item) => [item.handle, item]));
    const merged = branchFallback.flatMap((item) => {
      const override = byHandle.get(item.handle);
      if (!override) return [item];
      byHandle.delete(item.handle);
      if (override.active === false) return [];
      const variants = override.branchVariants?.length
        ? override.branchVariants
        : override.branchPrice != null
          ? [
              {
                name: override.branchPriceLabel || "Standard",
                price: override.branchPrice,
                compareAtPrice: override.branchCompareAtPrice,
              },
            ]
          : override.variants?.length
            ? override.variants
            : item.variants;
      const collectionTitles = override.collectionTitles || [];
      return [
        normalizeItem({
          ...item,
          ...override,
          tags: collectionTitles.length
            ? collectionTitles
            : override.category
              ? [override.category]
              : item.tags,
          images: override.images?.length ? override.images : item.images,
          variants,
        }),
      ];
    });
    return prepareCatalog([
      ...merged,
      ...[...byHandle.values()]
        .filter((item) => item.active !== false)
        .map((item) =>
          normalizeItem({
            handle: item.handle,
            title: item.title,
            description: item.description || "",
            kind: item.kind,
            tags: item.collectionTitles?.length
              ? item.collectionTitles
              : item.category
                ? [item.category]
                : [],
            images: item.images || [],
            variants: item.branchVariants?.length
              ? item.branchVariants
              : item.branchPrice != null
                ? [
                    {
                      name: item.branchPriceLabel || "Standard",
                      price: item.branchPrice,
                      compareAtPrice: item.branchCompareAtPrice,
                    },
                  ]
                : item.variants || [],
            concerns: item.concerns,
            expectedResults: item.expectedResults,
            treatmentAreas: item.treatmentAreas,
            duration: item.duration,
            downtime: item.downtime,
            sessions: item.sessions,
            faqs: item.faqs,
            beforeAfter: item.beforeAfter,
            brand: item.brand,
            gtin: item.gtin,
            mpn: item.mpn,
            googleProductCategory: item.googleProductCategory,
            merchantCondition: item.merchantCondition,
            merchantAvailability: item.merchantAvailability,
          }),
        ),
    ]);
  } catch {
    return prepareCatalog(branchFallback);
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
      current.concerns = [
        ...new Set([...(current.concerns || []), ...(item.concerns || [])]),
      ];
      current.images = current.images.length ? current.images : item.images;
      current.variants = [...current.variants, ...item.variants];
    }
  }
  return [...combined.values()].sort((a, b) => a.title.localeCompare(b.title));
}
