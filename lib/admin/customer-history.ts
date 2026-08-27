import type { Booking } from "@/lib/admin/booking-types";

export type CustomerHistory = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  occupation: string;
  dateOfBirth: string;
  marketingConsent: boolean;
  marketingConsentUpdatedAt: string | null;
  bookings: Booking[];
  lastVisitAt: string;
};

/**
 * Customer records currently share booking storage with appointments. These
 * entries provide treatment/consultation history, but do not reserve calendar
 * time and must not be rendered as appointments.
 */
export function isRecordOnlyBooking(booking: Booking) {
  return (
    booking.status === "completed" &&
    booking.serviceId === "manual" &&
    (booking.practitionerName === "Historical record" ||
      booking.practitionerName === "Consultation record" ||
      booking.notes.startsWith("Digital consultation saved:"))
  );
}

function customerKey(booking: Booking) {
  const email = booking.customerEmail.trim().toLowerCase();
  if (email) return `email:${email}`;
  return `phone:${booking.customerPhone.replace(/\D/g, "") || booking.customerPhone.trim().toLowerCase()}`;
}

function latestConsent(bookings: Booking[]) {
  return bookings.reduce(
    (latest, booking) => {
      if (!latest) return booking;
      const latestTime = latest.marketingConsentUpdatedAt
        ? new Date(latest.marketingConsentUpdatedAt).getTime()
        : 0;
      const bookingTime = booking.marketingConsentUpdatedAt
        ? new Date(booking.marketingConsentUpdatedAt).getTime()
        : 0;
      return bookingTime >= latestTime ? booking : latest;
    },
    undefined as Booking | undefined,
  );
}

export function buildCustomerHistories(bookings: Booking[]): CustomerHistory[] {
  const groups = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const key = customerKey(booking);
    groups.set(key, [...(groups.get(key) || []), booking]);
  }

  return Array.from(groups.entries())
    .map(([id, customerBookings]) => {
      const sorted = [...customerBookings].sort((a, b) =>
        b.startsAt.localeCompare(a.startsAt),
      );
      const latestBooking = sorted[0];
      const consentBooking = latestConsent(sorted) || latestBooking;
      return {
        id,
        name: latestBooking.customerName,
        email: latestBooking.customerEmail,
        phone: latestBooking.customerPhone,
        address: latestBooking.customerAddress || "",
        gender: latestBooking.customerGender || "",
        occupation: latestBooking.customerOccupation || "",
        dateOfBirth: latestBooking.customerDateOfBirth || "",
        marketingConsent: consentBooking.marketingConsent,
        marketingConsentUpdatedAt: consentBooking.marketingConsentUpdatedAt,
        bookings: sorted,
        lastVisitAt: latestBooking.startsAt,
      };
    })
    .sort((a, b) => b.lastVisitAt.localeCompare(a.lastVisitAt));
}
