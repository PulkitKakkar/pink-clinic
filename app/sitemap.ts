import type { MetadataRoute } from "next";
import { branches } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";
import { locations, services } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk";
  const catalogUrls = (await Promise.all(branches.map(async (branch) => (await getBranchCatalog(branch.slug)).map((item) => `/products-services/${branch.slug}/${item.handle}`)))).flat();
  return ["", "/treatments/select-branch", "/courses", "/contact", "/locations", ...branches.flatMap(branch => [`/treatments/${branch.slug}`, `/products-services/${branch.slug}`]), ...branches.flatMap(branch => services.map(service => `/treatments/${branch.slug}/${service.slug}`)), ...catalogUrls, ...locations.map(location => `/locations/${location.slug}`)].map(url => ({ url: `${base}${url}`, lastModified: new Date(), changeFrequency: "weekly", priority: url === "" ? 1 : .8 }));
}
