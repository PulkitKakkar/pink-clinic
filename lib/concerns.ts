import type { CatalogItem } from "@/lib/catalog";

export type TreatmentConcern = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  terms: string[];
  goals: string[];
  whatItMeans: string;
  commonSigns: string[];
  approaches: { title: string; description: string }[];
  whatToExpect: string[];
};

export const treatmentConcerns: TreatmentConcern[] = [
  {
    slug: "lines-wrinkles",
    name: "Lines and wrinkle treatments",
    shortName: "Lines & wrinkles",
    description:
      "Consultation-led options designed to soften the appearance of lines while keeping results considered and personal.",
    terms: ["anti wrinkle", "jalupro"],
    goals: [
      "Soften visible lines",
      "Maintain natural expression",
      "Refresh tired-looking skin",
    ],
    whatItMeans:
      "Lines are a natural part of expression and ageing. Their visibility can be influenced by repeated movement, changes in skin quality, hydration and sun exposure. The right approach depends on whether your priority is movement-related lines, skin quality or an overall refreshed appearance.",
    commonSigns: [
      "Forehead or frown lines",
      "Lines around the eyes",
      "Changes in elasticity or skin quality",
      "A tired-looking appearance",
    ],
    approaches: [
      {
        title: "Expression-led consultation",
        description:
          "A practitioner assesses facial movement, balance and the result you want before discussing suitable options.",
      },
      {
        title: "Skin-quality support",
        description:
          "Hydration and rejuvenation treatments may be considered when texture and skin quality are the main priority.",
      },
      {
        title: "A combined plan",
        description:
          "Some goals may benefit from staged treatments rather than trying to address everything in one appointment.",
      },
    ],
    whatToExpect: [
      "A face-to-face health and suitability assessment",
      "A discussion about natural movement and realistic outcomes",
      "Clear preparation, aftercare and review guidance",
    ],
  },
  {
    slug: "pigmentation",
    name: "Pigmentation treatments",
    shortName: "Pigmentation",
    description:
      "Personalised skin plans for uneven tone, visible sun damage and areas of pigmentation.",
    terms: ["pigment", "cosmelan", "dermamelan"],
    goals: [
      "More even-looking tone",
      "Brighter complexion",
      "Target visible sun damage",
    ],
    whatItMeans:
      "Pigmentation describes areas where skin appears darker or uneven. It can have several causes, including sun exposure, inflammation and hormonal changes, so correct assessment matters before treatment. Some pigmentation concerns should be reviewed by a medical professional before any cosmetic procedure.",
    commonSigns: [
      "Uneven-looking skin tone",
      "Dark patches or isolated marks",
      "Post-blemish discolouration",
      "Visible effects of sun exposure",
    ],
    approaches: [
      {
        title: "Professional skin assessment",
        description:
          "Pink reviews your skin, recent exposure, products and treatment history before recommending a plan.",
      },
      {
        title: "Clinic treatments",
        description:
          "Peels, facials or device-led options may be considered where suitable for the pigmentation type and skin.",
      },
      {
        title: "Consistent home care",
        description:
          "Daily sun protection and an appropriate skincare routine are often important parts of a longer-term plan.",
      },
    ],
    whatToExpect: [
      "Questions about when the pigmentation appeared",
      "A review of skincare, medicines and recent sun exposure",
      "A staged plan with realistic timelines and maintenance advice",
    ],
  },
  {
    slug: "skin-boosters",
    name: "Skin hydration and rejuvenation treatments",
    shortName: "Skin hydration & rejuvenation",
    description:
      "Hydration and rejuvenation treatments selected around your skin quality, texture and radiance goals.",
    terms: [
      "jalupro",
      "morpheus8",
      "skin rejuvenation",
      "hydrafacial",
      "chemical peel",
      "dermaplaning",
      "micro needling",
      "microdermabrasion",
    ],
    goals: [
      "Improve hydration",
      "Support skin quality",
      "Restore visible radiance",
    ],
    whatItMeans:
      "Skin booster is a broad term used for treatments intended to support hydration and overall skin quality rather than change facial shape. Different treatments work in different ways, so the best choice depends on your skin, desired result and comfort with downtime.",
    commonSigns: [
      "Dehydrated or dull-looking skin",
      "Fine, crepey texture",
      "Reduced visible radiance",
      "A preference for gradual skin-quality improvement",
    ],
    approaches: [
      {
        title: "Hydration-focused facials",
        description:
          "Non-injectable options can cleanse, exfoliate and hydrate with little or no expected downtime.",
      },
      {
        title: "Injectable skin treatments",
        description:
          "Where appropriate, consultation-led injectable options may support hydration or skin quality.",
      },
      {
        title: "Device-led rejuvenation",
        description:
          "Energy or needling-based treatments may be discussed for texture and longer-term remodelling goals.",
      },
    ],
    whatToExpect: [
      "A comparison of injectable and non-injectable choices",
      "An honest discussion about downtime and treatment courses",
      "A plan based on skin quality rather than trends",
    ],
  },
  {
    slug: "acne-texture",
    name: "Acne and skin texture treatments",
    shortName: "Acne & texture",
    description:
      "A consultation-led approach to congestion, post-acne marks, scarring and uneven skin texture.",
    terms: ["acne", "scar", "carbon peel", "morpheus8"],
    goals: [
      "Refine uneven texture",
      "Support clearer-looking skin",
      "Target post-acne marks",
    ],
    whatItMeans:
      "Active breakouts, congestion, post-acne marks and scarring are different concerns and may need different approaches. Pink begins by understanding what is active now, how your skin behaves and what products or treatments you have already tried.",
    commonSigns: [
      "Congestion or recurring blemishes",
      "Post-acne marks",
      "Uneven or rough texture",
      "Visible acne scarring",
    ],
    approaches: [
      {
        title: "Calm and clarify",
        description:
          "A considered skincare and facial plan may help support congested or blemish-prone skin.",
      },
      {
        title: "Texture-focused treatments",
        description:
          "Peels or device-led treatments may be discussed once the skin is suitable and active inflammation is considered.",
      },
      {
        title: "Refer when appropriate",
        description:
          "Persistent, painful or severe acne may need assessment and treatment by a GP or dermatologist.",
      },
    ],
    whatToExpect: [
      "A review of current breakouts, sensitivity and scarring",
      "Questions about prescriptions and active skincare",
      "A gradual plan designed to protect the skin barrier",
    ],
  },
  {
    slug: "unwanted-hair",
    name: "Unwanted hair treatments",
    shortName: "Unwanted hair",
    description:
      "Laser, waxing and threading options for smoother skin across face and body areas.",
    terms: ["laser hair removal", "waxing", "threading"],
    goals: [
      "Longer-lasting smoothness",
      "Treat face or body areas",
      "Choose a plan around your routine",
    ],
    whatItMeans:
      "Hair-removal choices differ in longevity, preparation and suitability. Laser is normally planned as a course, while waxing and threading provide flexible maintenance options. Hair colour, skin tone, treatment area and medical history can affect what is appropriate.",
    commonSigns: [
      "Regular shaving or waxing",
      "Visible facial or body hair",
      "Shaving-related irritation",
      "A preference for longer-term reduction",
    ],
    approaches: [
      {
        title: "Laser hair removal",
        description:
          "A patch-tested course can offer longer-term hair reduction where hair and skin characteristics are suitable.",
      },
      {
        title: "Waxing",
        description:
          "A practical face or body option for removing hair from the root without committing to a course.",
      },
      {
        title: "Threading",
        description:
          "A precise option often chosen for facial areas and brow shaping.",
      },
    ],
    whatToExpect: [
      "A patch test and consultation before laser treatment",
      "Clear guidance about shaving, sun exposure and products",
      "A treatment schedule based on the area and hair-growth cycle",
    ],
  },
  {
    slug: "hair-loss",
    name: "Hair loss and thinning hair support",
    shortName: "Hair loss",
    description:
      "A careful starting point for thinning, shedding and scalp concerns, with supportive hair care and guidance on when to speak to your GP.",
    terms: ["hair spa", "scalp"],
    goals: [
      "Understand visible changes",
      "Support hair and scalp care",
      "Know when medical assessment matters",
    ],
    whatItMeans:
      "Hair loss can appear as gradual thinning, increased shedding, a receding hairline or distinct patches. Causes vary and can include hereditary pattern hair loss, illness, stress, weight loss, iron deficiency, medicines or scalp conditions. A salon service can support the condition and appearance of the hair and scalp, but it cannot diagnose the cause or promise regrowth.",
    commonSigns: [
      "More shedding than usual",
      "A widening parting or reduced density",
      "A receding hairline or thinning crown",
      "Patchy loss or a change in the scalp",
    ],
    approaches: [
      {
        title: "Start with the cause",
        description:
          "Speak to your GP before using a commercial hair clinic, particularly when loss is sudden, patchy, unexplained or accompanied by scalp symptoms.",
      },
      {
        title: "Supportive hair and scalp care",
        description:
          "Gentle salon care may help the hair feel conditioned and the scalp feel cared for, but it is not a medical hair-loss treatment.",
      },
      {
        title: "Set realistic expectations",
        description:
          "No option works for every type of hair loss. Any proposed treatment should be discussed only after the likely cause and limitations are understood.",
      },
    ],
    whatToExpect: [
      "Questions about when the change began and how it has progressed",
      "Clear separation between supportive salon care and medical treatment",
      "A recommendation to seek GP or dermatology advice where appropriate",
    ],
  },
  {
    slug: "body-contouring",
    name: "Weight management and body shaping treatments",
    shortName: "Weight & body shaping",
    description:
      "Explore targeted body-shaping options alongside honest guidance about when medical weight-management support is more appropriate.",
    terms: ["lemon bottle"],
    goals: [
      "Discuss targeted areas",
      "Explore non-surgical options",
      "Build a personalised plan",
    ],
    whatItMeans:
      "Non-surgical body treatments are designed around specific cosmetic goals rather than weight loss. Suitability varies considerably, and outcomes depend on the treatment, area and individual response. A consultation is essential before any injectable or device-led option.",
    commonSigns: [
      "A specific area you would like to discuss",
      "Interest in non-surgical options",
      "Questions about realistic changes",
      "A need to understand downtime and aftercare",
    ],
    approaches: [
      {
        title: "Goal and suitability review",
        description:
          "The practitioner discusses the area, your health history and whether a cosmetic treatment is appropriate.",
      },
      {
        title: "Targeted treatment options",
        description:
          "Available options, limitations, side effects and likely treatment plans are explained before you decide.",
      },
      {
        title: "Honest alternatives",
        description:
          "Pink may recommend no treatment or suggest that another professional is better placed to help.",
      },
    ],
    whatToExpect: [
      "A confidential health and suitability consultation",
      "No promises of weight loss or guaranteed results",
      "Clear consent, aftercare and escalation information",
    ],
  },
  {
    slug: "wellness-vitamins",
    name: "Wellness, IV drip and vitamin treatments",
    shortName: "Wellness, IV drips & vitamins",
    description:
      "Consultation-led IV drips and vitamin injections, considered around your health history, suitability and individual needs.",
    terms: [
      "iv drip",
      "iv drop",
      "vitamin im injections",
      "vitamin injection",
      "vitamin b12",
      "glutathione",
      "biotin injection",
      "myers cocktail",
    ],
    goals: [
      "Understand the available options",
      "Discuss suitability and safety",
      "Choose only after an individual assessment",
    ],
    whatItMeans:
      "IV drips and vitamin injections deliver nutrients by intravenous or intramuscular administration. They are clinical procedures rather than routine beauty services, and suitability depends on your health, medicines, symptoms and whether there is a diagnosed deficiency or medical reason for treatment.",
    commonSigns: [
      "Questions about vitamin or nutrient support",
      "Interest in injectable wellness treatments",
      "A wish to understand evidence, risks and alternatives",
      "Symptoms that may need assessment by a GP before treatment",
    ],
    approaches: [
      {
        title: "Health and suitability review",
        description:
          "A qualified practitioner reviews relevant conditions, medicines, allergies, symptoms and previous reactions before recommending any procedure.",
      },
      {
        title: "Explain the exact treatment",
        description:
          "The ingredients, route of administration, evidence, limitations, possible side effects and alternatives should be clear before consent.",
      },
      {
        title: "Refer when appropriate",
        description:
          "Unexplained fatigue, recurrent symptoms or suspected deficiency may require GP assessment and appropriate testing rather than a cosmetic wellness treatment.",
      },
    ],
    whatToExpect: [
      "A consultation and clinical suitability assessment",
      "Clear information about ingredients, risks and realistic limitations",
      "Aftercare instructions and guidance about when to seek help",
    ],
  },
];

export function getConcernBySlug(slug: string) {
  return treatmentConcerns.find((concern) => concern.slug === slug);
}

export function matchesConcern(
  item: Pick<CatalogItem, "title" | "tags" | "concerns">,
  concern: TreatmentConcern | string,
) {
  const selected =
    typeof concern === "string"
      ? treatmentConcerns.find(
          (entry) =>
            entry.slug === concern ||
            entry.name === concern ||
            entry.shortName === concern,
        )
      : concern;
  if (!selected) return false;
  if (item.concerns) return item.concerns.includes(selected.slug);
  const searchable = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
  return selected.terms.some((term) => searchable.includes(term));
}

export type BeautyServiceArea = {
  slug: string;
  name: string;
  description: string;
  terms: string[];
};

export const beautyServiceAreas: BeautyServiceArea[] = [
  {
    slug: "facials-skin-maintenance",
    name: "Facials, body & skin maintenance",
    description: "Glow, hydration and routine face or body appointments.",
    terms: ["facial", "eye firming", "body treatment", "body bleaching"],
  },
  {
    slug: "hair",
    name: "Hair",
    description: "Cuts, colour, styling and hair care.",
    terms: ["hair services", "hair care", "balayage"],
  },
  {
    slug: "eyes-brows-lashes",
    name: "Eyes, brows & lashes",
    description: "Definition, tinting, lifts and shaping.",
    terms: ["eyes & brows", "eyebrow", "eyelash"],
  },
  {
    slug: "nails",
    name: "Nails",
    description: "Manicures, pedicures and lasting finishes.",
    terms: ["nails", "manicure", "pedicure", "shellac"],
  },
  {
    slug: "makeup",
    name: "Makeup",
    description: "Bridal, party and special-occasion makeup.",
    terms: [
      "bridal makeup",
      "professional party makeup",
      "special occasion makeup",
    ],
  },
  {
    slug: "semi-permanent-makeup-piercing",
    name: "Semi-permanent makeup & piercing",
    description: "Brows, lip blush and professional piercing.",
    terms: [
      "semi permanent makeup",
      "piercing",
      "micro-blading",
      "micro-shading",
      "combination brows",
      "lip enhancement",
    ],
  },
];

export function matchesBeautyServiceArea(
  item: Pick<CatalogItem, "title" | "tags">,
  area: BeautyServiceArea | string,
) {
  const selected =
    typeof area === "string"
      ? beautyServiceAreas.find((entry) => entry.slug === area)
      : area;
  if (!selected) return false;
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
