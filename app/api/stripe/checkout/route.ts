import { NextResponse } from "next/server";
import { getBranchBySlug } from "@/lib/branches";
import { services } from "@/lib/content";
import { getBookings } from "@/lib/admin/booking-storage";
import { getAvailableSlots, londonDateString } from "@/lib/booking-availability";
import { staffMembers } from "@/lib/admin/booking-config";
import { pricingProvider } from "@/lib/pricing";
import { getSiteUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutRequest = { branchSlug?: string; serviceSlug?: string; startsAt?: string };

export async function POST(request: Request) {
  try {
    const { branchSlug, serviceSlug, startsAt: startsAtValue } = (await request.json()) as CheckoutRequest;
    const branch = branchSlug ? getBranchBySlug(branchSlug) : undefined;
    const service = serviceSlug ? services.find((item) => item.slug === serviceSlug) : undefined;
    const startsAt = new Date(startsAtValue || "");
    if (!branch || !service || Number.isNaN(startsAt.valueOf()))
      return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });

    const price = pricingProvider.getTreatmentPrice(service.id, branch.id)?.price;
    const durationMinutes = service.id === "laser-hair-removal" ? 60 : Number(service.duration?.match(/\d+/)?.[0]) || 60;
    const available = getAvailableSlots({
      date: londonDateString(startsAt), durationMinutes, bookings: await getBookings(), staff: staffMembers,
      branchId: branch.id, serviceId: service.id,
    }).includes(startsAt.toISOString());
    if (price == null || !available)
      return NextResponse.json({ error: "That appointment time is no longer available. Please select another." }, { status: 409 });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/checkout/${branch.slug}/${service.slug}`,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      custom_fields: [
        { key: "first_name", label: { type: "custom", custom: "First name" }, type: "text", text: { minimum_length: 1, maximum_length: 80 } },
        { key: "last_name", label: { type: "custom", custom: "Last name" }, type: "text", text: { minimum_length: 1, maximum_length: 80 } },
      ],
      line_items: [{ price_data: { currency: "gbp", unit_amount: Math.round(price * 100), product_data: { name: service.title, description: `${branch.name} · ${service.duration || "Appointment"}` }, }, quantity: 1 }],
      metadata: { branch_id: branch.id, service_id: service.id, treatment_name: service.title, duration_minutes: String(durationMinutes), starts_at: startsAt.toISOString() },
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Unable to create Stripe Checkout Session", error);
    return NextResponse.json({ error: "Unable to start secure checkout. Please try again." }, { status: 500 });
  }
}
