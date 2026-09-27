import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { BookingConflictError, createBooking, getBookings } from "@/lib/admin/booking-storage";
import { staffMembers } from "@/lib/admin/booking-config";
import { availableStaffForStart } from "@/lib/booking-availability";
import { sendBookingNotification } from "@/lib/notifications/booking-notifications";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function textField(session: Stripe.Checkout.Session, key: string) {
  return session.custom_fields?.find((field) => field.key === key)?.text?.value?.trim() || "";
}

async function confirmBooking(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const { branch_id: branchId, service_id: serviceId, treatment_name: treatmentName, duration_minutes: durationValue, starts_at: startsAtValue } = session.metadata || {};
  const startsAt = new Date(startsAtValue || "");
  const durationMinutes = Number(durationValue);
  const customer = session.customer_details;
  const firstName = textField(session, "first_name");
  const lastName = textField(session, "last_name");
  const address = customer?.address;
  const customerAddress = [address?.line1, address?.line2, address?.city, address?.state].filter(Boolean).join(", ");
  if (!branchId || !serviceId || !treatmentName || !firstName || !lastName || !customer?.email || !customer?.phone || !customerAddress || !address?.postal_code || Number.isNaN(startsAt.valueOf()) || !Number.isInteger(durationMinutes))
    throw new Error(`Checkout session ${session.id} is missing required booking details.`);

  // A repeated Stripe delivery must not create or notify a second booking.
  if ((await getBookings()).some((booking) => booking.notes.includes(`Stripe Checkout Session: ${session.id}`))) return;
  const eligible = availableStaffForStart({ bookings: await getBookings(), staff: staffMembers, branchId, serviceId, startsAt, durationMinutes });
  for (const member of eligible) {
    try {
      const booking = await createBooking({ branchId, staffId: member.id, practitionerName: member.name, serviceId, treatmentName, durationMinutes, customerFirstName: firstName, customerLastName: lastName, customerEmail: customer.email, customerPhone: customer.phone, customerAddress, customerPostcode: address.postal_code, marketingConsent: false, startsAt: startsAt.toISOString(), status: "confirmed", notes: `Stripe Checkout Session: ${session.id}\nStripe Payment Intent: ${typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || ""}` });
      await sendBookingNotification(booking, "booking-confirmation");
      return;
    } catch (error) {
      if (!(error instanceof BookingConflictError)) throw error;
    }
  }
  // A paid customer should never be silently acknowledged as booked if the slot was taken.
  throw new Error(`No practitioner available for paid Checkout Session ${session.id}.`);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return new NextResponse("Webhook configuration error", { status: 400 });
  let event: Stripe.Event;
  try { event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret); }
  catch (error) { console.warn("Invalid Stripe webhook signature", error); return new NextResponse("Invalid signature", { status: 400 }); }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded")
      await confirmBooking(event.data.object as Stripe.Checkout.Session);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe booking confirmation failed", error);
    return new NextResponse("Unable to confirm booking", { status: 500 });
  }
}
