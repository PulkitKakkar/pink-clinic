import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey)
    throw new Error("Stripe is not configured.");
  return new Stripe(secretKey);
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredUrl)
    throw new Error("NEXT_PUBLIC_SITE_URL is required for Stripe Checkout.");
  return configuredUrl.replace(/\/$/, "");
}
