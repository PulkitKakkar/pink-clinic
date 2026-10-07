import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogItem } from "@/lib/catalog";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ create: vi.fn(), catalog: vi.fn(), save: vi.fn(), health: vi.fn(), bookings: vi.fn(), slots: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ getSiteUrl: () => "https://pinkclinic.co.uk", getStripe: () => ({ checkout: { sessions: { create: mocks.create } } }) }));
vi.mock("@/lib/catalog", () => ({ getBranchCatalog: mocks.catalog }));
vi.mock("@/lib/payments/order-storage", () => ({ savePaymentOrder: mocks.save, checkPaymentOrderStorageHealth: mocks.health }));
vi.mock("@/lib/admin/booking-storage", () => ({ getBookings: mocks.bookings, checkBookingStorageHealth: mocks.health }));
vi.mock("@/lib/booking-availability", () => ({ getAvailableSlots: mocks.slots, londonDateString: () => "2026-10-10" }));
import { POST } from "@/app/api/stripe/checkout/route";

const product: CatalogItem = { handle: "cream", title: "Cream", kind: "product", description: "", images: [], tags: [], variants: [{ name: "Standard", price: 25 }] };
const payload = { branchSlug: "reading-west-st", acceptTerms: true, items: [{ handle: "cream", variantName: "Standard", quantity: 1 }] };
const request = (body: unknown) => new Request("https://pinkclinic.co.uk/api/stripe/checkout", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "cs_test_session", url: "https://checkout.stripe.com/pay/test" }); mocks.catalog.mockResolvedValue([product]); mocks.save.mockResolvedValue(undefined); mocks.health.mockResolvedValue(undefined); });

describe("Stripe Checkout API", () => {
  it.each(["reading-west-st", "reading-watlington-st"])("creates a real Stripe session for %s using server prices and UK delivery", async (branchSlug) => {
    const response = await POST(request({ ...payload, branchSlug, unitPrice: 0.01 }));
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ mode: "payment", payment_method_types: ["card"], shipping_address_collection: { allowed_countries: ["GB"] }, line_items: [expect.objectContaining({ quantity: 1, price_data: expect.objectContaining({ unit_amount: 2500, currency: "gbp" }) })], shipping_options: [expect.objectContaining({ shipping_rate_data: expect.objectContaining({ fixed_amount: { amount: 499, currency: "gbp" } }) })] }));
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ amountTotal: 2999, shippingAmount: 499, status: "pending", source: "basket" }));
  });
  it("rejects unaccepted terms and unknown branches before creating a session", async () => {
    expect((await POST(request({ ...payload, acceptTerms: false }))).status).toBe(400);
    expect((await POST(request({ ...payload, branchSlug: "fake" }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects unavailable variants before taking payment", async () => {
    mocks.catalog.mockResolvedValue([{ ...product, variants: [{ name: "Standard", price: 25, available: false }] }]);
    expect((await POST(request(payload))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("does not redirect the customer if the order cannot be persisted", async () => {
    mocks.save.mockRejectedValueOnce(new Error("Storage unavailable"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(request(payload));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("url");
    spy.mockRestore();
  });
  it("returns catalogue cancellation to the purchased item", async () => {
    await POST(request({ ...payload, catalogHandle: "cream" }));
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ cancel_url: "https://pinkclinic.co.uk/checkout/reading-west-st/catalog/cream" }));
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ source: "catalog" }));
  });
  it("does not request delivery for treatments", async () => {
    mocks.catalog.mockResolvedValue([{ ...product, kind: "service" }]);
    await POST(request(payload));
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty("shipping_address_collection");
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ amountTotal: 2500, shippingAmount: 0 }));
  });
});
