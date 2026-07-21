import type { BookingIntent, BookingProvider } from "./types";
import { pricingProvider } from "@/lib/pricing";

class ConfigurableBookingProvider implements BookingProvider {
  getBookingUrl(intent: BookingIntent = {}) {
    if (intent.branchId && intent.branchSlug && intent.serviceSlug) {
      const treatmentPrice = pricingProvider.getTreatmentPrice(intent.serviceSlug, intent.branchId);
      if (treatmentPrice?.price != null) return `/checkout/${intent.branchSlug}/${intent.serviceSlug}`;
    }

    const url = new URL("/contact", process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk");

    Object.entries(intent).forEach(([key, value]) => value && url.searchParams.set(key, value));
    return `${url.pathname}${url.search}`;
  }
}

// Priced treatments go to checkout. Consultation-only and general booking
// calls carry their context into the enquiry form.
export const bookingProvider: BookingProvider = new ConfigurableBookingProvider();
