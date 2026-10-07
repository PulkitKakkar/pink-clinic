import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentOrder } from "@/lib/payments/types";
import type Stripe from "stripe";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ retrieve: vi.fn(), getOrder: vi.fn(), saveOrder: vi.fn(), bookings: vi.fn(), createBooking: vi.fn(), notify: vi.fn(), staff: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ checkout: { sessions: { retrieve: mocks.retrieve } } }) }));
vi.mock("@/lib/payments/order-storage", () => ({ getPaymentOrder: mocks.getOrder, savePaymentOrder: mocks.saveOrder }));
vi.mock("@/lib/admin/booking-storage", () => ({ getBookings: mocks.bookings, createBooking: mocks.createBooking, BookingConflictError: class extends Error {}, PaymentAlreadyBookedError: class extends Error {} }));
vi.mock("@/lib/booking-availability", () => ({ availableStaffForStart: mocks.staff }));
vi.mock("@/lib/notifications/booking-notifications", () => ({ sendBookingNotification: mocks.notify }));
import { verifyPaymentOrder, confirmPaidAppointment, fulfilStripeSession } from "@/lib/payments/stripe-orders";
import { PaymentAlreadyBookedError } from "@/lib/admin/booking-storage";

const order: PaymentOrder = { sessionId: "cs_test_paid", source: "basket", branchId: "reading-west-street", branchSlug: "reading-west-st", status: "pending", amountTotal: 15000, shippingAmount: 0, customer: null, shippingAddress: "", createdAt: "2026-10-07T10:00:00Z", items: [{ handle: "facial", variantName: "Standard", quantity: 1, title: "Facial", kind: "service", unitAmount: 15000, serviceId: "catalog:facial", requiresShipping: false, durationMinutes: 45 }] };
const session = () => ({ id: order.sessionId, mode: "payment", status: "complete", payment_status: "paid", currency: "gbp", amount_total: 15000, metadata: { branch_id: order.branchId }, payment_intent: { status: "succeeded", latest_charge: { paid: true, amount_refunded: 0, refunded: false, disputed: false } }, custom_fields: [{ key: "first_name", text: { value: "Test" } }, { key: "last_name", text: { value: "Customer" } }], customer_details: { email: "test@example.com", phone: "07123456789", address: { line1: "1 Test Street", city: "Reading", country: "GB", postal_code: "RG1 1TT" } } } as unknown as Stripe.Checkout.Session);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getOrder.mockResolvedValue(structuredClone(order));
  mocks.retrieve.mockResolvedValue(session());
  mocks.bookings.mockResolvedValue([]);
  mocks.staff.mockReturnValue([{ id: "staff", name: "Practitioner" }]);
  mocks.createBooking.mockResolvedValue({ id: "booking", stripePaymentKey: `${order.sessionId}:0:0` });
  mocks.notify.mockResolvedValue({ sent: true });
});

describe("Stripe verification and booking", () => {
  it("rejects simulated references before contacting Stripe", async () => {
    await expect(verifyPaymentOrder("TEST-FAKE")).rejects.toThrow();
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it.each([
    { payment_status: "unpaid" }, { status: "open" }, { amount_total: 1 }, { currency: "usd" }, { metadata: { branch_id: "other-branch" } },
    { payment_intent: { status: "succeeded", latest_charge: { paid: true, refunded: true, amount_refunded: 15000 } } },
    { payment_intent: { status: "succeeded", latest_charge: { paid: true, disputed: true } } },
    { payment_intent: { status: "processing", latest_charge: null } },
  ])("rejects an unverified or mismatched payment %j", async (changes) => {
    mocks.retrieve.mockResolvedValue({ ...session(), ...changes });
    await expect(verifyPaymentOrder(order.sessionId)).rejects.toThrow();
    expect(mocks.saveOrder).not.toHaveBeenCalled();
  });
  it("persists customer details only after verifying the payment", async () => {
    const paid = await verifyPaymentOrder(order.sessionId);
    expect(paid.status).toBe("paid");
    expect(paid.customer?.firstName).toBe("Test");
    expect(mocks.saveOrder).toHaveBeenCalledWith(paid);
  });
  it("rechecks Stripe even for an order previously marked paid", async () => {
    mocks.getOrder.mockResolvedValue({ ...order, status: "paid", customer: { firstName: "Test" } });
    mocks.retrieve.mockResolvedValue({ ...session(), payment_status: "unpaid" });
    await expect(verifyPaymentOrder(order.sessionId)).rejects.toThrow();
  });
  it("rejects an appointment key that was not purchased", async () => {
    const paid = await verifyPaymentOrder(order.sessionId);
    await expect(confirmPaidAppointment(paid, `${order.sessionId}:0:1`, "2026-10-09T10:00:00Z")).rejects.toThrow();
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });
  it("uses purchased treatment and customer details and a durable unique key", async () => {
    const paid = await verifyPaymentOrder(order.sessionId);
    await confirmPaidAppointment(paid, `${order.sessionId}:0:0`, "2026-10-09T10:00:00Z");
    expect(mocks.createBooking).toHaveBeenCalledWith(expect.objectContaining({ serviceId: "catalog:facial", durationMinutes: 45, customerEmail: "test@example.com" }), expect.objectContaining({ paymentKey: `${order.sessionId}:0:0` }));
    expect(mocks.notify).toHaveBeenCalledTimes(1);
  });
  it("returns an existing booking without creating or notifying again", async () => {
    const paid = await verifyPaymentOrder(order.sessionId);
    mocks.bookings.mockResolvedValue([{ id: "existing", stripePaymentKey: `${order.sessionId}:0:0` }]);
    expect((await confirmPaidAppointment(paid, `${order.sessionId}:0:0`, "2026-10-09T10:00:00Z")).id).toBe("existing");
    expect(mocks.createBooking).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });
  it("handles simultaneous requests that lose the unique-key race", async () => {
    const paid = await verifyPaymentOrder(order.sessionId);
    mocks.bookings.mockResolvedValueOnce([]).mockResolvedValue([{ id: "winner", stripePaymentKey: `${order.sessionId}:0:0` }]);
    mocks.createBooking.mockRejectedValueOnce(new PaymentAlreadyBookedError());
    expect((await confirmPaidAppointment(paid, `${order.sessionId}:0:0`, "2026-10-09T10:00:00Z")).id).toBe("winner");
    expect(mocks.notify).not.toHaveBeenCalled();
  });
  it("webhook fulfilment stores catalogue orders without booking an unselected time", async () => {
    await fulfilStripeSession(order.sessionId);
    expect(mocks.saveOrder).toHaveBeenCalledTimes(1);
    expect(mocks.createBooking).not.toHaveBeenCalled();
  });
});
