import { describe, expect, it } from "vitest";
import { getBookableBasketItems } from "@/lib/basket/checkout";
import type { BasketItem } from "@/lib/basket/types";

const item = (handle: string, kind?: BasketItem["kind"]): BasketItem => ({
  id: handle,
  branchId: "reading-west-street",
  branchSlug: "reading-west-st",
  handle,
  title: handle,
  variantName: "Standard",
  unitPrice: 100,
  quantity: 1,
  image: "",
  kind,
});

describe("basket checkout appointments", () => {
  it("creates calendars only for service items", () => {
    const result = getBookableBasketItems(
      [item("facial", "service"), item("cleanser", "product"), item("academy", "course")],
      [],
    );
    expect(result.map(({ item: entry }) => entry.handle)).toEqual(["facial"]);
  });

  it("supports baskets saved before kind metadata was added", () => {
    const result = getBookableBasketItems(
      [item("facial"), item("cleanser")],
      [
        { handle: "facial", kind: "service", duration: "45 minutes" },
        { handle: "cleanser", kind: "product" },
      ],
    );
    expect(result).toHaveLength(1);
    expect(result[0].durationMinutes).toBe(45);
  });

  it("creates one appointment step per purchased treatment quantity", () => {
    const treatment = { ...item("facial", "service"), quantity: 2 };
    expect(getBookableBasketItems([treatment], [])).toHaveLength(2);
  });
});
