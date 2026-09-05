import { NextResponse } from "next/server";
import {
  BookingConfigurationError,
  BookingConflictError,
  BookingValidationError,
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
} from "@/lib/admin/booking-storage";
import type {
  BookingStatus,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/lib/admin/booking-types";
import type { BookingNotificationType } from "@/lib/notifications/types";
import { sendBookingNotification } from "@/lib/notifications/booking-notifications";
import { changedFields, logAdminActivity } from "@/lib/admin/activity-log";

async function notifySafely(
  booking: Awaited<ReturnType<typeof createBooking>>,
  type: BookingNotificationType,
) {
  try {
    return await sendBookingNotification(booking, type);
  } catch (error) {
    return {
      sent: false,
      reason:
        error instanceof Error
          ? error.message
          : "Notification could not be sent.",
    };
  }
}

export async function GET() {
  return NextResponse.json({ bookings: await getBookings() });
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CreateBookingInput & {
      suppressNotification?: boolean;
      historicalRecord?: boolean;
    };
    const booking = await createBooking(
      {
        ...input,
        status: input.historicalRecord ? "completed" : "confirmed",
      },
      {
        requireAddress: !input.historicalRecord,
        requirePostcode: !input.historicalRecord,
      },
    );
    await logAdminActivity({ action: "created", entity: input.historicalRecord ? "treatment record" : "booking", entityId: booking.id, summary: `${input.historicalRecord ? "Treatment record" : "Booking"} added for ${booking.customerName}`, changes: { after: booking } });
    return NextResponse.json(
      {
        booking,
        notification: input.suppressNotification
          ? undefined
          : await notifySafely(booking, "booking-confirmation"),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BookingConflictError)
      return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not create booking." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateBookingInput;
    const statuses: BookingStatus[] = [
      "confirmed",
      "completed",
      "cancelled",
      "no-show",
    ];
    if (!body.id || (body.status && !statuses.includes(body.status)))
      return NextResponse.json(
        { error: "Invalid booking update." },
        { status: 400 },
      );
    const previous = (await getBookings()).find(
      (booking) => booking.id === body.id,
    );
    const booking = await updateBooking(body);
    await logAdminActivity({ action: "updated", entity: "booking", entityId: booking.id, summary: `Booking updated for ${booking.customerName}`, changes: changedFields(previous || {}, booking) });
    const changed =
      previous &&
      [
        "branchId",
        "staffId",
        "practitionerName",
        "serviceId",
        "treatmentName",
        "durationMinutes",
        "startsAt",
        "customerName",
        "customerEmail",
        "customerPhone",
      ].some(
        (key) =>
          previous[key as keyof typeof previous] !==
          booking[key as keyof typeof booking],
      );
    const type =
      previous?.status !== "cancelled" && booking.status === "cancelled"
        ? "booking-cancelled"
        : changed
          ? "booking-updated"
          : undefined;
    return NextResponse.json({
      booking,
      notification: type ? await notifySafely(booking, type) : undefined,
    });
  } catch (error) {
    if (error instanceof BookingConflictError)
      return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof BookingValidationError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not update booking." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id)
      return NextResponse.json(
        { error: "Booking id is required." },
        { status: 400 },
      );
    const booking = (await getBookings()).find((item) => item.id === body.id);
    const deleted = await deleteBooking(body.id);
    await logAdminActivity({ action: "deleted", entity: "booking", entityId: deleted.id, summary: `Booking deleted${booking ? ` for ${booking.customerName}` : ""}`, changes: { before: booking || {} } });
    return NextResponse.json({ deleted });
  } catch (error) {
    if (error instanceof BookingValidationError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not delete booking." },
      { status: 500 },
    );
  }
}
