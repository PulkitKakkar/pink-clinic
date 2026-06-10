import type { MetadataRoute } from "next";
import { locations, services } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk";
  return ["", "/services", "/courses", "/contact", ...services.map(s => `/services/${s.slug}`), ...locations.map(l => `/locations/${l.slug}`)].map(url => ({ url: `${base}${url}`, lastModified: new Date(), changeFrequency: "weekly", priority: url === "" ? 1 : .8 }));
}
