import type { Booking } from "@/lib/admin/booking-types";

export function isFutureAppointment(booking: Booking, currentTime: number) {
  return (
    booking.status === "confirmed" &&
    new Date(booking.startsAt).getTime() > currentTime
  );
}

export function getAppointmentSummary(bookings: Booking[], currentTime: number) {
  const nextAppointment = bookings
    .filter((booking) => isFutureAppointment(booking, currentTime))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const lastVisit = bookings
    .filter(
      (booking) =>
        booking.status !== "cancelled" &&
        new Date(booking.startsAt).getTime() <= currentTime,
    )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];

  return { nextAppointment, lastVisit };
}
