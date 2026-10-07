import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ construct: vi.fn(), fulfil: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ webhooks: { constructEvent: mocks.construct } }) }));
vi.mock("@/lib/payments/stripe-orders", () => ({ fulfilStripeSession: mocks.fulfil, isPaidCheckoutEvent: (event: { type: string }) => ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) }));
import { POST } from "@/app/api/stripe/webhook/route";
const request = (signature = "signature") => new Request("https://pinkclinic.co.uk/api/stripe/webhook", { method: "POST", body: "raw-body", headers: { "stripe-signature": signature } });
const event = (payment_status = "paid", type = "checkout.session.completed") => ({ type, data: { object: { id: "cs_test_paid", payment_status, metadata: { pink_checkout: "v1" } } } });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test"); mocks.construct.mockReturnValue(event()); mocks.fulfil.mockResolvedValue({}); });
afterEach(() => vi.unstubAllEnvs());
describe("Stripe signed webhooks", () => {
  it("verifies the raw body and signing secret before fulfilling an order", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.construct).toHaveBeenCalledWith("raw-body", "signature", "whsec_test");
    expect(mocks.fulfil).toHaveBeenCalledWith("cs_test_paid");
  });
  it("rejects invalid signatures without fulfilling", async () => {
    mocks.construct.mockImplementation(() => { throw new Error("Invalid signature"); });
    expect((await POST(request())).status).toBe(400);
    expect(mocks.fulfil).not.toHaveBeenCalled();
  });
  it("acknowledges an unpaid session without treating it as paid", async () => {
    mocks.construct.mockReturnValue(event("unpaid"));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.fulfil).not.toHaveBeenCalled();
  });
  it("handles async success", async () => {
    mocks.construct.mockReturnValue(event("paid", "checkout.session.async_payment_succeeded"));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.fulfil).toHaveBeenCalledTimes(1);
  });
  it("returns a retryable failure when paid-order persistence fails", async () => {
    mocks.fulfil.mockRejectedValueOnce(new Error("Database unavailable"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(request())).status).toBe(500);
    spy.mockRestore();
  });
});
