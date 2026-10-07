import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ verify: vi.fn(), confirm: vi.fn(), bookings: vi.fn(), slots: vi.fn() }));
vi.mock("@/lib/payments/stripe-orders", () => ({ verifyPaymentOrder: mocks.verify, confirmPaidAppointment: mocks.confirm, PaymentVerificationError: class extends Error {} }));
vi.mock("@/lib/admin/booking-storage", () => ({ getBookings: mocks.bookings, BookingConflictError: class extends Error {}, BookingValidationError: class extends Error {}, BookingConfigurationError: class extends Error {} }));
vi.mock("@/lib/booking-availability", () => ({ getAvailableSlots: mocks.slots, londonDateString: () => "2026-10-10" }));
import { POST } from "@/app/api/bookings/route";
import { PaymentVerificationError } from "@/lib/payments/stripe-orders";
const request = (body: unknown) => new Request("https://pinkclinic.co.uk/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const body = { paymentReference: "cs_test_paid", paymentAppointmentKey: "cs_test_paid:0:0", startsAt: "2026-10-10T10:00:00.000Z" };
const order = { sessionId: "cs_test_paid", branchId: "reading-west-street", status: "paid", items: [{ kind: "service", quantity: 1, serviceId: "catalog:facial", title: "Facial", durationMinutes: 45 }] };
beforeEach(() => { vi.clearAllMocks(); mocks.verify.mockResolvedValue(order); mocks.bookings.mockResolvedValue([]); mocks.slots.mockReturnValue([body.startsAt]); mocks.confirm.mockResolvedValue({ id: "booking" }); });
describe("paid booking API", () => {
  it("rejects the old client payment-reference-only flow", async () => {
    expect((await POST(request({ ...body, paymentAppointmentKey: undefined, paymentReference: "TEST-FAKE" }))).status).toBe(400);
    expect(mocks.confirm).not.toHaveBeenCalled();
  });
  it("rejects unpaid Stripe sessions", async () => {
    mocks.verify.mockRejectedValue(new PaymentVerificationError("Not paid"));
    expect((await POST(request(body))).status).toBe(403);
    expect(mocks.confirm).not.toHaveBeenCalled();
  });
  it("rejects a forged entitlement", async () => {
    expect((await POST(request({ ...body, paymentAppointmentKey: "cs_test_paid:0:99" }))).status).toBe(403);
    expect(mocks.confirm).not.toHaveBeenCalled();
  });
  it("ignores client branch, treatment, duration and identity", async () => {
    const response = await POST(request({ ...body, branchId: "fake", serviceId: "expensive", durationMinutes: 480, customerEmail: "fake@example.com" }));
    expect(response.status).toBe(201);
    expect(mocks.slots).toHaveBeenCalledWith(expect.objectContaining({ branchId: "reading-west-street", serviceId: "catalog:facial", durationMinutes: 45 }));
    expect(mocks.confirm).toHaveBeenCalledWith(order, body.paymentAppointmentKey, body.startsAt);
  });
  it("rejects occupied slots while preserving the paid entitlement", async () => {
    mocks.slots.mockReturnValue([]);
    expect((await POST(request(body))).status).toBe(409);
    expect(mocks.confirm).not.toHaveBeenCalled();
  });
  it("returns the existing booking on retries", async () => {
    mocks.bookings.mockResolvedValue([{ id: "existing", stripePaymentKey: body.paymentAppointmentKey }]);
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect((await response.json()).booking.id).toBe("existing");
    expect(mocks.confirm).not.toHaveBeenCalled();
  });
});
