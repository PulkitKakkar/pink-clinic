import { describe, expect, it } from "vitest";
import { checkoutTotals, resolveCheckoutItems } from "@/lib/payments/catalog-checkout";
import { paymentAppointments, type PaymentOrder } from "@/lib/payments/types";
import type { CatalogItem } from "@/lib/catalog";

const catalog: CatalogItem[] = [
  { handle: "facial", title: "Facial", kind: "service", duration: "45 minutes", description: "", tags: [], images: [], variants: [{ name: "Standard", price: 150 }, { name: "Unavailable", price: 100, available: false }] },
  { handle: "cream", title: "Cream", kind: "product", description: "", tags: [], images: [], variants: [{ name: "50ml", price: 25 }] },
  { handle: "course", title: "Course", kind: "course", description: "", tags: [], images: [], variants: [{ name: "Standard", price: 200 }] },
];
const request = { handle: "facial", variantName: "Standard", quantity: 1 };

describe("Stripe catalogue prices and entitlements", () => {
  it("uses server prices and duration, ignoring client price and kind", () => {
    const [item] = resolveCheckoutItems([{ ...request, unitPrice: 0.01, kind: "product" } as typeof request], catalog);
    expect(item.unitAmount).toBe(15000);
    expect(item.kind).toBe("service");
    expect(item.durationMinutes).toBe(45);
  });
  it.each([0, -1, 1.5, 21, "1", NaN])("rejects invalid quantity %s", (quantity) => {
    expect(() => resolveCheckoutItems([{ ...request, quantity: quantity as number }], catalog)).toThrow();
  });
  it("rejects unknown items, variants, unavailable stock and empty baskets", () => {
    for (const input of [[], [{ ...request, handle: "unknown" }], [{ ...request, variantName: "fake" }], [{ ...request, variantName: "Unavailable" }]]) expect(() => resolveCheckoutItems(input, catalog)).toThrow();
    expect(() => resolveCheckoutItems([request], [{ ...catalog[0], merchantAvailability: "out_of_stock" }])).toThrow();
  });
  it("calculates delivery using products only, including the £75 boundary", () => {
    const product = { handle: "cream", variantName: "50ml", quantity: 1 };
    expect(checkoutTotals(resolveCheckoutItems([request], catalog)).shippingAmount).toBe(0);
    expect(checkoutTotals(resolveCheckoutItems([request, product], catalog))).toEqual({ subtotal: 17500, shippingAmount: 499, amountTotal: 17999 });
    expect(checkoutTotals(resolveCheckoutItems([{ ...product, quantity: 3 }], catalog)).shippingAmount).toBe(0);
  });
  it("does not add parcel delivery charges to gift cards", () => {
    const gift = { ...catalog[1], handle: "pink-beauty-salon-and-academy-gift-card" };
    const items = resolveCheckoutItems([{ handle: gift.handle, variantName: "50ml", quantity: 1 }], [gift]);
    expect(checkoutTotals(items).shippingAmount).toBe(0);
    expect(items[0].requiresShipping).toBe(false);
  });
  it("issues one unique appointment key per service quantity and none for products or courses", () => {
    const items = resolveCheckoutItems([{ ...request, quantity: 2 }, { handle: "cream", variantName: "50ml", quantity: 1 }, { handle: "course", variantName: "Standard", quantity: 1 }], catalog);
    const order = { sessionId: "cs_test_paid", items } as PaymentOrder;
    const appointments = paymentAppointments(order);
    expect(appointments.map((entry) => entry.key)).toEqual(["cs_test_paid:0:0", "cs_test_paid:0:1"]);
    expect(appointments.every((entry) => entry.durationMinutes === 45)).toBe(true);
  });
});
