import { describe, expect, it } from "vitest";
import { searchSite } from "@/lib/search";

describe("site search", () => {
  it("uses the main treatment page as the sole plain Hydrafacial result", () => {
    const results = searchSite("Hydrafacial");
    const plainHydrafacial = results.filter((item) => item.title === "Hydrafacial");

    expect(plainHydrafacial).toHaveLength(1);
    expect(plainHydrafacial[0]).toMatchObject({
      id: "service-hydrafacial",
      href: "/products-services/item/hydrafacial",
    });
    expect(results.some((item) => item.id === "catalog-luxury-hydrafacial-buy-1-get-2nd-half-price")).toBe(true);
  });
});
