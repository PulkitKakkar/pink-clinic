export type Service = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  description: string;
  duration: string;
  image: string;
  benefits: string[];
};

export type Offer = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  action: "book" | "buy";
  href?: string;
  serviceSlug?: string;
};

// Local fallback offers. These can be replaced by published Sanity offer documents.
export const offers: Offer[] = [
  {
    id: "hydrafacial-glow",
    eyebrow: "Limited-time skin offer",
    title: "The signature glow.",
    description: "Reveal deeply cleansed, hydrated and luminous skin with our signature Hydrafacial.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=2000&q=90",
    price: "From £99",
    action: "book",
    serviceSlug: "hydrafacial",
  },
  {
    id: "laser-course",
    eyebrow: "Course package",
    title: "Smooth skin starts here.",
    description: "Begin your tailored laser hair removal course with our advanced clinic team.",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=2000&q=90",
    price: "Course offers available",
    action: "buy",
    href: "/contact?type=offer&offer=laser-course",
  },
  {
    id: "skin-rejuvenation",
    eyebrow: "Clinic exclusive",
    title: "Restore your radiance.",
    description: "A personalised skin rejuvenation plan designed around your complexion and goals.",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=2000&q=90",
    price: "Consultation-led",
    action: "book",
    serviceSlug: "skin-rejuvenation",
  },
];

export const services: Service[] = [
  {
    id: "hydrafacial",
    slug: "hydrafacial",
    title: "Hydrafacial",
    category: "Signature Skin",
    excerpt: "A deeply cleansing, intensely hydrating facial for an immediate glass-skin glow.",
    description: "Our signature Hydrafacial combines cleansing, exfoliation, extraction and targeted hydration in one luxurious appointment, tailored precisely to your skin.",
    duration: "60 minutes",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Instant radiance", "Deep hydration", "Zero downtime"],
  },
  {
    id: "laser-hair-removal",
    slug: "laser-hair-removal",
    title: "Laser Hair Removal",
    category: "Laser Clinic",
    excerpt: "Advanced, comfortable laser technology for beautifully smooth, lasting results.",
    description: "A safe and effective programme using advanced laser technology, delivered by trained professionals after a detailed consultation.",
    duration: "15–60 minutes",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Long-lasting results", "All skin types", "Tailored course plans"],
  },
  {
    id: "skin-rejuvenation",
    slug: "skin-rejuvenation",
    title: "Skin Rejuvenation",
    category: "Advanced Aesthetics",
    excerpt: "Precision-led treatments to restore clarity, tone and visible luminosity.",
    description: "Our skin specialists create a personalised plan to improve tone, texture and radiance using clinic-grade technology and skincare.",
    duration: "45 minutes",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Brighter complexion", "Improved texture", "Personalised protocol"],
  },
  {
    id: "anti-wrinkle-treatments",
    slug: "anti-wrinkle-treatments",
    title: "Anti-Wrinkle Treatments",
    category: "Medical Aesthetics",
    excerpt: "Subtle, considered treatments designed to refresh, never change, your expression.",
    description: "A consultation-led approach to natural-looking rejuvenation, focused on balance, movement and results that feel unmistakably you.",
    duration: "30 minutes",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Natural-looking results", "Expert consultation", "Aftercare included"],
  },
];

export const locations = [
  { id: "reading-west-street", treatmentSlug: "reading-west-st", slug: "west-street-reading", name: "West Street", address: "4–5 West Street, Reading RG1 1TT", phone: "0118 962 7111", image: "/images/west-street.jpg", note: "Central Reading salon", instagramHandle: "@pinkbeautysalonreading", instagramUrl: "https://www.instagram.com/pinkbeautysalonreading/" },
  { id: "reading-watlington-street", treatmentSlug: "reading-watlington-st", slug: "watlington-street-reading", name: "Watlington Street", address: "25 Watlington Street, Reading RG1 4EN", phone: "0118 962 7111", image: "/images/watlington.jpg", note: "Advanced clinic & academy", instagramHandle: "@pink_aesthetics_clinic_reading", instagramUrl: "https://www.instagram.com/pink_aesthetics_clinic_reading/" },
];

export const reviews = [
  { name: "Priya S.", text: "The team made me feel completely at ease. My skin has never looked this radiant and the aftercare was exceptional.", service: "Hydrafacial", initials: "PS" },
  { name: "Amelia R.", text: "A beautiful clinic with genuinely knowledgeable professionals. Every detail feels premium, warm and considered.", service: "Skin Rejuvenation", initials: "AR" },
  { name: "Sofia K.", text: "I trained with Pink Academy and left feeling confident, supported and ready to take paying clients. Worth every penny.", service: "Beauty Academy", initials: "SK" },
];
