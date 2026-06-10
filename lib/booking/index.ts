import type { BookingIntent, BookingService } from "./types";

class ConfigurableBookingService implements BookingService {
  getBookingUrl(intent: BookingIntent = {}) {
    const base = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact";
    const url = new URL(base, process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk");

    Object.entries(intent).forEach(([key, value]) => value && url.searchParams.set(key, value));
    return base.startsWith("/") ? `${url.pathname}${url.search}` : url.toString();
  }
}

// Swap this instance for a Fresha, Stripe or custom API adapter without changing UI code.
export const bookingService: BookingService = new ConfigurableBookingService();
