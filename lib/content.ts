export type Service = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  benefits: string[];
};

export const services: Service[] = [
  {
    slug: "hydrafacial",
    title: "Hydrafacial",
    category: "Signature Skin",
    excerpt: "A deeply cleansing, intensely hydrating facial for an immediate glass-skin glow.",
    description: "Our signature Hydrafacial combines cleansing, exfoliation, extraction and targeted hydration in one luxurious appointment, tailored precisely to your skin.",
    price: "From £95",
    duration: "60 minutes",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Instant radiance", "Deep hydration", "Zero downtime"],
  },
  {
    slug: "laser-hair-removal",
    title: "Laser Hair Removal",
    category: "Laser Clinic",
    excerpt: "Advanced, comfortable laser technology for beautifully smooth, lasting results.",
    description: "A safe and effective programme using advanced laser technology, delivered by trained professionals after a detailed consultation.",
    price: "From £25",
    duration: "15–60 minutes",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Long-lasting results", "All skin types", "Tailored course plans"],
  },
  {
    slug: "skin-rejuvenation",
    title: "Skin Rejuvenation",
    category: "Advanced Aesthetics",
    excerpt: "Precision-led treatments to restore clarity, tone and visible luminosity.",
    description: "Our skin specialists create a personalised plan to improve tone, texture and radiance using clinic-grade technology and skincare.",
    price: "From £100",
    duration: "45 minutes",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Brighter complexion", "Improved texture", "Personalised protocol"],
  },
  {
    slug: "anti-wrinkle-treatments",
    title: "Anti-Wrinkle Treatments",
    category: "Medical Aesthetics",
    excerpt: "Subtle, considered treatments designed to refresh, never change, your expression.",
    description: "A consultation-led approach to natural-looking rejuvenation, focused on balance, movement and results that feel unmistakably you.",
    price: "Consultation required",
    duration: "30 minutes",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=85",
    benefits: ["Natural-looking results", "Expert consultation", "Aftercare included"],
  },
];

export const locations = [
  { slug: "west-street-reading", name: "West Street", address: "4–5 West Street, Reading RG1 1TT", phone: "0118 962 7111", image: "/images/west-street.jpg", note: "Central Reading salon" },
  { slug: "watlington-street-reading", name: "Watlington Street", address: "25 Watlington Street, Reading RG1 4EN", phone: "0118 962 7111", image: "/images/watlington.jpg", note: "Advanced clinic & academy" },
];

export const reviews = [
  { name: "Priya S.", text: "The team made me feel completely at ease. My skin has never looked this radiant and the aftercare was exceptional.", service: "Hydrafacial", initials: "PS" },
  { name: "Amelia R.", text: "A beautiful clinic with genuinely knowledgeable professionals. Every detail feels premium, warm and considered.", service: "Skin Rejuvenation", initials: "AR" },
  { name: "Sofia K.", text: "I trained with Pink Academy and left feeling confident, supported and ready to take paying clients. Worth every penny.", service: "Beauty Academy", initials: "SK" },
];
