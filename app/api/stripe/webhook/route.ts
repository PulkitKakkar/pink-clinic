import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { fulfilStripeSession, isPaidCheckoutEvent } from "@/lib/payments/stripe-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return new NextResponse("Webhook configuration error", { status: 400 });
  let event: Stripe.Event;
  try { event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret); }
  catch { return new NextResponse("Invalid signature", { status: 400 }); }
  try {
    if (isPaidCheckoutEvent(event)) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.pink_checkout === "v1" && session.payment_status === "paid") await fulfilStripeSession(session.id);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe order confirmation failed", error);
    return new NextResponse("Unable to confirm order", { status: 500 });
  }
}
