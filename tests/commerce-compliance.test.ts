import { describe, expect, it } from "vitest";
import {
  getBranchCatalog,
  isGoogleMerchantEligible,
  isPayPalPayLaterEligible,
} from "@/lib/catalog";

describe("commerce compliance boundaries", () => {
  it("limits Google Merchant Center and unapproved PayPal Pay Later to goods", async () => {
    const catalogue = await getBranchCatalog("reading-west-st");
    for (const item of catalogue) {
      expect(isGoogleMerchantEligible(item)).toBe(item.kind === "product");
      expect(isPayPalPayLaterEligible(item)).toBe(item.kind === "product");
    }
  });

  it("does not publicly sell prescription-led lines and wrinkles treatments", async () => {
    const catalogue = await getBranchCatalog("reading-west-st");
    const entries = catalogue.filter((item) =>
      ["anti-wrinkle-fillers", "anti-wrinkle-injections"].includes(item.handle),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const item of entries) {
      expect(item.title).toBe("Consultation for lines and wrinkles");
      expect(item.variants).toEqual([]);
      expect(item.description).not.toMatch(/botox|botulinum/i);
    }
  });

  it("removes unsupported benefit claims from public IV therapy entries", async () => {
    const catalogue = await getBranchCatalog("reading-west-st");
    const entries = catalogue.filter((item) =>
      /iv therapy consultation/i.test(item.title),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const item of entries) {
      expect(item.variants).toEqual([]);
      expect(item.description).not.toMatch(
        /100% absorption|removes? toxins|boosts? immunity|treats? chronic|immediate benefits/i,
      );
    }
  });
});
