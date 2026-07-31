import type { MetadataRoute } from "next";
import { branches } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";
import { locations, services } from "@/lib/content";
import { treatmentConcerns } from "@/lib/concerns";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const catalogUrls = [
    ...new Set(
      (
        await Promise.all(
          branches.map(async (branch) =>
            (await getBranchCatalog(branch.slug)).map(
              (item) => `/products-services/item/${item.handle}`,
            ),
          ),
        )
      ).flat(),
    ),
  ];
  return [
    "",
    "/products-services",
    "/treatment-finder",
    "/treatments/select-branch",
    "/courses",
    "/contact",
    "/locations",
    "/privacy",
    "/cookies",
    "/terms",
    "/cancellations",
    "/returns",
    "/delivery",
    "/accessibility",
    ...treatmentConcerns.map((concern) => `/concerns/${concern.slug}`),
    ...branches.flatMap((branch) => [
      `/treatments/${branch.slug}`,
      `/products-services/${branch.slug}`,
    ]),
    ...branches.flatMap((branch) =>
      services.map((service) => `/treatments/${branch.slug}/${service.slug}`),
    ),
    ...catalogUrls,
    ...locations.map((location) => `/locations/${location.slug}`),
  ].map((url) => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: url === "" ? 1 : 0.8,
  }));
}
