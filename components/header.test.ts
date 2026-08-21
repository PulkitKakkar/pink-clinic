import { describe, expect, it } from "vitest";
import { usesLightHeader } from "@/components/header";

describe("usesLightHeader", () => {
  it.each([
    "/concerns/lines-wrinkles",
    "/checkout/west-street/basket",
    "/checkout/west-street/anti-wrinkle",
    "/checkout/west-street/catalog/skin-care",
  ])("uses dark navigation over the light background at %s", (pathname) => {
    expect(usesLightHeader(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/products-services",
    "/treatments/west-street",
    "/locations",
    "/courses",
    "/contact",
    "/basket",
    "/privacy",
  ])("keeps white navigation over the dark hero at %s", (pathname) => {
    expect(usesLightHeader(pathname)).toBe(false);
  });
});
