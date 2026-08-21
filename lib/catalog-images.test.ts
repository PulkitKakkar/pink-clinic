import { describe, expect, it } from "vitest";
import { catalogImageFallback, getCatalogImage } from "@/lib/catalog-images";

describe("getCatalogImage", () => {
  it("uses the first usable catalogue image", () => {
    expect(getCatalogImage(["", "/images/treatment.jpg"])).toBe(
      "/images/treatment.jpg",
    );
  });

  it("uses the generated fallback when photography is missing", () => {
    expect(getCatalogImage([])).toBe(catalogImageFallback);
    expect(getCatalogImage([""])).toBe(catalogImageFallback);
  });
});
