import type { BookingIntent, BookingProvider } from "./types";

class ConfigurableBookingProvider implements BookingProvider {
  getBookingUrl(intent: BookingIntent = {}) {
    const base = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact";
    const url = new URL(base, process.env.NEXT_PUBLIC_SITE_URL || "https://pinkbeauty.co.uk");

    Object.entries(intent).forEach(([key, value]) => value && url.searchParams.set(key, value));
    return base.startsWith("/") ? `${url.pathname}${url.search}` : url.toString();
  }
}

// Swap this instance for a Fresha or custom booking adapter without changing UI code.
export const bookingProvider: BookingProvider = new ConfigurableBookingProvider();
