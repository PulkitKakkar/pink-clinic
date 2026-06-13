import { branches } from "@/lib/branches";
import { offers, services } from "@/lib/content";

export type SearchItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  keywords: string[];
  serviceSlug?: string;
};

const courses = ["VTCT Beauty Therapy", "Laser & IPL", "Semi-Permanent Makeup", "Facial & Skincare", "Waxing", "Gel Manicure & Pedicure"];

export const searchItems: SearchItem[] = [
  ...services.map((service) => ({
    id: `service-${service.id}`,
    title: service.title,
    description: service.excerpt,
    category: "Treatment",
    href: `/treatments/select-branch?service=${service.slug}`,
    serviceSlug: service.slug,
    keywords: [service.category, service.description, ...service.benefits],
  })),
  ...branches.map((branch) => ({
    id: `branch-${branch.id}`,
    title: branch.name,
    description: branch.address,
    category: "Location",
    href: `/treatments/${branch.slug}`,
    keywords: [branch.note, "branch", "salon", "clinic", "Reading"],
  })),
  ...courses.map((course) => ({
    id: `course-${course.toLowerCase().replaceAll(" ", "-")}`,
    title: course,
    description: "Professional beauty training at Pink Beauty Academy.",
    category: "Course",
    href: "/courses",
    keywords: ["academy", "training", "qualification", "accredited", "learn"],
  })),
  ...offers.map((offer) => ({
    id: `offer-${offer.id}`,
    title: offer.title,
    description: offer.description,
    category: "Offer",
    href: offer.action === "book" && offer.serviceSlug ? `/treatments/select-branch?service=${offer.serviceSlug}` : offer.href || "/#offers",
    keywords: [offer.eyebrow, offer.price || "", "deal", "promotion", "special"],
  })),
  { id: "page-services", title: "Our Services", description: "Explore beauty and aesthetic treatments.", category: "Page", href: "/#services", keywords: ["treatments", "facials", "aesthetics"] },
  { id: "page-team", title: "Our Team", description: "Meet the Pink Beauty team across both branches.", category: "Page", href: "/#team", keywords: ["staff", "professionals", "practitioners", "therapists"] },
  { id: "page-reviews", title: "Client Reviews", description: "Read verified client stories from both branches.", category: "Page", href: "/#reviews", keywords: ["testimonials", "google", "ratings", "client stories"] },
  { id: "page-contact", title: "Contact Pink Beauty", description: "Book, enquire or speak with our team.", category: "Page", href: "/contact", keywords: ["phone", "email", "enquiry", "help", "book"] },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function searchSite(query: string) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return searchItems.slice(0, 6);

  return searchItems
    .map((item) => {
      const title = normalize(item.title);
      const content = normalize([item.title, item.description, item.category, ...item.keywords].join(" "));
      const score = terms.reduce((total, term) => total + (title === term ? 12 : title.startsWith(term) ? 8 : title.includes(term) ? 5 : content.includes(term) ? 2 : -20), 0);
      return { item, score };
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}
