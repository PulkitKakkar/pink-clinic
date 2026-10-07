import { NextResponse } from "next/server";
import { getBranchBySlug } from "@/lib/branches";
import { services } from "@/lib/content";
import { getBranchCatalog } from "@/lib/catalog";
import { checkBookingStorageHealth, getBookings } from "@/lib/admin/booking-storage";
import { getAvailableSlots, londonDateString } from "@/lib/booking-availability";
import { staffMembers } from "@/lib/admin/booking-config";
import { pricingProvider } from "@/lib/pricing";
import { getSiteUrl, getStripe } from "@/lib/stripe";
import { CheckoutValidationError, checkoutTotals, resolveCheckoutItems } from "@/lib/payments/catalog-checkout";
import { checkPaymentOrderStorageHealth, savePaymentOrder } from "@/lib/payments/order-storage";
import type { CheckoutItemInput, PaymentItem } from "@/lib/payments/types";

export const runtime = "nodejs";
type CheckoutRequest = { branchSlug?: string; serviceSlug?: string; startsAt?: string; items?: CheckoutItemInput[]; acceptTerms?: boolean; catalogHandle?: string };

export async function POST(request: Request) {
  try {
    const input = await request.json() as CheckoutRequest;
    const branch = typeof input.branchSlug === "string" ? getBranchBySlug(input.branchSlug) : undefined;
    if (!branch || input.acceptTerms !== true) throw new CheckoutValidationError("Choose a branch and accept the checkout terms.");
    let items: PaymentItem[];
    let startsAt: string | undefined;
    let cancelPath: string;
    if (input.serviceSlug) {
      if (input.items) throw new CheckoutValidationError("Choose one checkout flow.");
      const service = services.find((item) => item.slug === input.serviceSlug);
      const date = new Date(input.startsAt || "");
      if (!service || Number.isNaN(date.valueOf())) throw new CheckoutValidationError("Invalid treatment or appointment time.");
      const price = pricingProvider.getTreatmentPrice(service.id, branch.id)?.price;
      const durationMinutes = service.id === "laser-hair-removal" ? 60 : Number(service.duration?.match(/\d+/)?.[0]) || 60;
      const available = getAvailableSlots({ date: londonDateString(date), durationMinutes, bookings: await getBookings(), staff: staffMembers, branchId: branch.id, serviceId: service.id }).includes(date.toISOString());
      if (price == null || !Number.isFinite(price) || price <= 0 || !available) return NextResponse.json({ error: "That appointment time is no longer available. Please select another." }, { status: 409 });
      items = [{ handle: service.slug, variantName: "", quantity: 1, title: service.title, kind: "service", unitAmount: Math.round(price * 100), serviceId: service.id, requiresShipping: false, durationMinutes }];
      startsAt = date.toISOString();
      cancelPath = `/checkout/${branch.slug}/${service.slug}`;
    } else {
      items = resolveCheckoutItems(input.items!, await getBranchCatalog(branch.slug));
      if (input.catalogHandle && (items.length !== 1 || items[0].handle !== input.catalogHandle)) throw new CheckoutValidationError("Invalid catalogue checkout.");
      cancelPath = input.catalogHandle ? `/checkout/${branch.slug}/catalog/${encodeURIComponent(items[0].handle)}` : `/checkout/${branch.slug}/basket`;
    }
    await checkBookingStorageHealth();
    await checkPaymentOrderStorageHealth();
    const totals = checkoutTotals(items);
    const hasProducts = items.some((item) => item.requiresShipping);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}${cancelPath}`,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      custom_fields: [
        { key: "first_name", label: { type: "custom", custom: "First name" }, type: "text", text: { minimum_length: 1, maximum_length: 80 } },
        { key: "last_name", label: { type: "custom", custom: "Last name" }, type: "text", text: { minimum_length: 1, maximum_length: 80 } },
      ],
      ...(hasProducts ? { shipping_address_collection: { allowed_countries: ["GB" as const] }, shipping_options: [{ shipping_rate_data: { type: "fixed_amount" as const, fixed_amount: { amount: totals.shippingAmount, currency: "gbp" }, display_name: "Royal Mail 48" } }] } : {}),
      line_items: items.map((item) => ({ price_data: { currency: "gbp", unit_amount: item.unitAmount, product_data: { name: item.title, description: `${branch.name}${item.variantName ? ` · ${item.variantName}` : ""}` } }, quantity: item.quantity })),
      metadata: { branch_id: branch.id, pink_checkout: "v1", terms_accepted: "true" },
      payment_intent_data: { metadata: { branch_id: branch.id, pink_checkout: "v1" } },
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    await savePaymentOrder({ sessionId: session.id, livemode: session.livemode, source: input.serviceSlug ? "treatment" : input.catalogHandle ? "catalog" : "basket", branchId: branch.id, branchSlug: branch.slug, items, amountTotal: totals.amountTotal, shippingAmount: totals.shippingAmount, status: "pending", customer: null, shippingAddress: "", createdAt: new Date().toISOString(), startsAt });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof CheckoutValidationError || error instanceof SyntaxError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Unable to create Stripe Checkout Session", error);
    return NextResponse.json({ error: "Unable to start secure checkout. Please try again." }, { status: 503 });
  }
}
