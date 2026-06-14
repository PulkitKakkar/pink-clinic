import { NextResponse } from "next/server";
import { BookingConfigurationError, BookingConflictError, BookingValidationError, createBooking, getBookings, updateBooking } from "@/lib/admin/booking-storage";
import type { BookingStatus, CreateBookingInput, UpdateBookingInput } from "@/lib/admin/booking-types";
import { sendBookingNotification } from "@/lib/notifications/booking-notifications";

async function notifySafely(booking: Awaited<ReturnType<typeof createBooking>>, type: "booking-confirmation" | "booking-updated" | "booking-cancelled") {
  try { return await sendBookingNotification(booking, type); }
  catch (error) { return { sent: false, reason: error instanceof Error ? error.message : "Notification could not be sent." }; }
}

export async function GET() {
  return NextResponse.json({ bookings: await getBookings() });
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as CreateBookingInput;
    const booking = await createBooking({ ...input, status: "confirmed" });
    return NextResponse.json({ booking, notification: await notifySafely(booking, "booking-confirmation") }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as UpdateBookingInput;
    const statuses: BookingStatus[] = ["confirmed", "completed", "cancelled", "no-show"];
    if (!body.id || (body.status && !statuses.includes(body.status))) return NextResponse.json({ error: "Invalid booking update." }, { status: 400 });
    const previous = (await getBookings()).find((booking) => booking.id === body.id);
    const booking = await updateBooking(body);
    const changed = previous && ["branchId", "staffId", "practitionerName", "serviceId", "treatmentName", "durationMinutes", "startsAt", "customerName", "customerEmail", "customerPhone"].some((key) => previous[key as keyof typeof previous] !== booking[key as keyof typeof booking]);
    const type = previous?.status !== "cancelled" && booking.status === "cancelled" ? "booking-cancelled" : changed ? "booking-updated" : undefined;
    return NextResponse.json({ booking, notification: type ? await notifySafely(booking, type) : undefined });
  } catch (error) {
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Could not update booking." }, { status: 500 });
  }
}
