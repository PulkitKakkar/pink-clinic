import type { BookingIntent, BookingProvider } from "./types";

class ConfigurableBookingProvider implements BookingProvider {
  getBookingUrl(intent: BookingIntent = {}) {
    const url = new URL("/contact", process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk");

    Object.entries(intent).forEach(([key, value]) => value && url.searchParams.set(key, value));
    return `${url.pathname}${url.search}`;
  }
}

// Booking calls to action stay on the Pink Beauty website and carry the
// customer's selected branch and treatment into the enquiry form.
export const bookingProvider: BookingProvider = new ConfigurableBookingProvider();
