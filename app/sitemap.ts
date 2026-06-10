import type { MetadataRoute } from "next";
import { branches } from "@/lib/branches";
import { locations, services } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk";
  return ["", "/treatments/select-branch", "/courses", "/contact", "/locations", ...branches.map(branch => `/treatments/${branch.slug}`), ...branches.flatMap(branch => services.map(service => `/treatments/${branch.slug}/${service.slug}`)), ...locations.map(location => `/locations/${location.slug}`)].map(url => ({ url: `${base}${url}`, lastModified: new Date(), changeFrequency: "weekly", priority: url === "" ? 1 : .8 }));
}
