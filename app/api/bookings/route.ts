import { NextResponse } from "next/server";
import { BookingConfigurationError, BookingConflictError, BookingValidationError, getBookings } from "@/lib/admin/booking-storage";
import { staffMembers } from "@/lib/admin/booking-config";
import { getAvailableSlots, londonDateString } from "@/lib/booking-availability";
import { PaymentVerificationError, confirmPaidAppointment, verifyPaymentOrder } from "@/lib/payments/stripe-orders";
import { paymentAppointments } from "@/lib/payments/types";

export async function POST(request: Request) {
  try {
    const input = await request.json() as { paymentReference?: string; paymentAppointmentKey?: string; startsAt?: string };
    const startsAt = new Date(input.startsAt || "");
    if (typeof input.paymentReference !== "string" || typeof input.paymentAppointmentKey !== "string" || Number.isNaN(startsAt.valueOf()))
      return NextResponse.json({ error: "A verified Stripe payment and appointment time are required." }, { status: 400 });
    const order = await verifyPaymentOrder(input.paymentReference);
    const appointment = paymentAppointments(order).find((entry) => entry.key === input.paymentAppointmentKey);
    if (!appointment) throw new PaymentVerificationError("This appointment was not included in the payment.");
    const bookings = await getBookings();
    const existing = bookings.find((booking) => booking.stripePaymentKey === appointment.key);
    if (existing) return NextResponse.json({ booking: existing });
    const available = getAvailableSlots({ date: londonDateString(startsAt), durationMinutes: appointment.durationMinutes, bookings, staff: staffMembers, branchId: order.branchId, serviceId: appointment.serviceId }).includes(startsAt.toISOString());
    if (!available) throw new BookingConflictError("That time has just been taken. Please choose another time; your payment remains valid.");
    const booking = await confirmPaidAppointment(order, appointment.key, startsAt.toISOString());
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof PaymentVerificationError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    console.error("Unable to book paid appointment", error);
    return NextResponse.json({ error: "Could not confirm payment or create the appointment. Please try again." }, { status: 503 });
  }
}
