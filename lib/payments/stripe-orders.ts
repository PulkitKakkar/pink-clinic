import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getPaymentOrder, savePaymentOrder } from "@/lib/payments/order-storage";
import { paymentAppointments, type PaymentOrder } from "@/lib/payments/types";
import { BookingConflictError, PaymentAlreadyBookedError, createBooking, getBookings } from "@/lib/admin/booking-storage";
import { staffMembers } from "@/lib/admin/booking-config";
import { availableStaffForStart } from "@/lib/booking-availability";
import { sendBookingNotification } from "@/lib/notifications/booking-notifications";

export class PaymentVerificationError extends Error {}

export async function verifyPaymentOrder(sessionId: string): Promise<PaymentOrder> {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) throw new PaymentVerificationError("Invalid payment reference.");
  const order = await getPaymentOrder(sessionId);
  if (!order) throw new PaymentVerificationError("Order not found.");
  const session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["payment_intent.latest_charge"] });
  const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const charge = intent && typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  if (session.mode !== "payment" || !intent || intent.status !== "succeeded" || !charge || !charge.paid || session.status !== "complete" || session.payment_status !== "paid" || session.currency !== "gbp" || session.amount_total !== order.amountTotal || session.metadata?.branch_id !== order.branchId || charge?.refunded || charge?.amount_refunded || charge?.disputed)
    throw new PaymentVerificationError("Payment is not confirmed or has been refunded. Please contact Pink if you need help.");
  const details = session.customer_details;
  const field = (key: string) => session.custom_fields?.find((field) => field.key === key)?.text?.value?.trim() || "";
  const address = details?.address;
  const customer = { firstName: field("first_name"), lastName: field("last_name"), email: details?.email || "", phone: details?.phone || "", address: [address?.line1, address?.line2, address?.city, address?.state, address?.country].filter(Boolean).join(", "), postcode: address?.postal_code || "" };
  if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone || !customer.address || !customer.postcode)
    throw new PaymentVerificationError("Payment received, but contact details need review. Please contact Pink with your payment reference.");
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = shipping ? [shipping.name, shipping.address.line1, shipping.address.line2, shipping.address.city, shipping.address.state, shipping.address.postal_code, shipping.address.country].filter(Boolean).join(", ") : "";
  if (order.items.some((item) => item.requiresShipping) && !shippingAddress) throw new PaymentVerificationError("Payment received, but the delivery address needs review. Please contact Pink.");
  const paid = { ...order, status: "paid" as const, customer, shippingAddress };
  await savePaymentOrder(paid);
  return paid;
}

export async function confirmPaidAppointment(order: PaymentOrder, key: string, startsAt: string) {
  const appointment = paymentAppointments(order).find((entry) => entry.key === key);
  if (!appointment || order.status !== "paid" || !order.customer) throw new PaymentVerificationError("This appointment was not included in the payment.");
  const bookings = await getBookings();
  const existing = bookings.find((booking) => booking.stripePaymentKey === key);
  if (existing) return existing;
  const staff = availableStaffForStart({ bookings, staff: staffMembers, branchId: order.branchId, serviceId: appointment.serviceId, startsAt: new Date(startsAt), durationMinutes: appointment.durationMinutes });
  for (const member of staff) {
    try {
      const customer = order.customer;
      const booking = await createBooking({ branchId: order.branchId, staffId: member.id, practitionerName: member.name, serviceId: appointment.serviceId, treatmentName: appointment.treatmentName, durationMinutes: appointment.durationMinutes, customerFirstName: customer.firstName, customerLastName: customer.lastName, customerEmail: customer.email, customerPhone: customer.phone, customerAddress: customer.address, customerPostcode: customer.postcode, marketingConsent: false, startsAt, status: "confirmed", notes: `Stripe Checkout Session: ${order.sessionId}\nPurchased option: ${appointment.treatmentName}` }, { paymentKey: key, requireAddress: true, requirePostcode: true });
      await sendBookingNotification(booking, "booking-confirmation").catch((error) => console.error("Paid booking notification failed", error));
      return booking;
    } catch (error) {
      if (error instanceof PaymentAlreadyBookedError) {
        const existing = (await getBookings()).find((booking) => booking.stripePaymentKey === key);
        if (existing) return existing;
      }
      if (!(error instanceof BookingConflictError)) throw error;
    }
  }
  throw new BookingConflictError("That time has just been taken. Please choose another time; your payment remains valid.");
}

export async function fulfilStripeSession(sessionId: string) {
  const order = await verifyPaymentOrder(sessionId);
  if (order.startsAt) {
    const appointment = paymentAppointments(order)[0];
    if (appointment) await confirmPaidAppointment(order, appointment.key, order.startsAt);
  }
  return order;
}

export function isPaidCheckoutEvent(event: Stripe.Event) {
  return event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
}
