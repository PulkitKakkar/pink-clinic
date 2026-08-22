import { describe, expect, it } from "vitest";
import { getBranchCatalog } from "@/lib/catalog";
import { concernDecisionGuides } from "@/lib/concern-guidance";
import { matchesConcern, treatmentConcerns } from "@/lib/concerns";

describe("treatment concern assignments", () => {
  it("treats explicit concern assignments as authoritative", () => {
    const carbonPeel = {
      title: "Carbon Peel Facial",
      tags: ["Carbon Peel Facial"],
      concerns: ["acne-texture"],
    };

    expect(matchesConcern(carbonPeel, "acne-texture")).toBe(true);
    expect(matchesConcern(carbonPeel, "pigmentation")).toBe(false);
  });

  it("allows a treatment to appear under multiple concerns", () => {
    const chemicalPeel = {
      title: "Chemical Peel",
      tags: ["Advanced Skincare"],
      concerns: ["pigmentation", "skin-boosters", "acne-texture"],
    };

    expect(matchesConcern(chemicalPeel, "pigmentation")).toBe(true);
    expect(matchesConcern(chemicalPeel, "skin-boosters")).toBe(true);
    expect(matchesConcern(chemicalPeel, "acne-texture")).toBe(true);
    expect(matchesConcern(chemicalPeel, "lines-wrinkles")).toBe(false);
  });

  it("does not infer a concern when an explicit empty list is supplied", () => {
    expect(
      matchesConcern(
        { title: "Carbon Peel Facial", tags: ["Carbon Peel"], concerns: [] },
        "acne-texture",
      ),
    ).toBe(false);
  });

  it("applies the curated assignments to both branch catalogues", async () => {
    const originalProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "replace-me";

    try {
      for (const branch of ["reading-west-st", "reading-watlington-st"]) {
        const items = await getBranchCatalog(branch);
        const byHandle = new Map(items.map((item) => [item.handle, item]));

        expect(byHandle.get("carbon-peel-facial")?.concerns).toEqual([
          "acne-texture",
        ]);
        expect(byHandle.get("chemical-peel")?.concerns).toEqual([
          "pigmentation",
          "skin-boosters",
          "acne-texture",
        ]);
        expect(byHandle.get("profhilo")?.concerns).toEqual([
          "lines-wrinkles",
          "skin-boosters",
        ]);
        expect(byHandle.get("body-morpheus8")?.concerns).toEqual([
          "body-contouring",
        ]);
        expect(byHandle.get("hair-spa")?.concerns).toEqual(["hair-loss"]);
      }
    } finally {
      if (originalProjectId === undefined) {
        delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      } else {
        process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = originalProjectId;
      }
    }
  });

  it("provides complete guidance for every concern", () => {
    for (const concern of treatmentConcerns) {
      expect(concernDecisionGuides[concern.slug], concern.slug).toBeDefined();
    }
  });
});
