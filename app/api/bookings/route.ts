import { NextResponse } from "next/server";
import {
  BookingConfigurationError,
  BookingConflictError,
  BookingValidationError,
  createBooking,
  getBookings,
} from "@/lib/admin/booking-storage";
import { staffMembers } from "@/lib/admin/booking-config";
import { availableStaffForStart, getAvailableSlots, londonDateString } from "@/lib/booking-availability";
import { sendBookingNotification } from "@/lib/notifications/booking-notifications";

type CustomerBookingRequest = {
  branchId?: string;
  serviceId?: string;
  treatmentName?: string;
  durationMinutes?: number;
  startsAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentReference?: string;
};

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CustomerBookingRequest;
    const startsAt = new Date(input.startsAt || "");
    const durationMinutes = Number(input.durationMinutes);
    if (
      !input.branchId ||
      !input.serviceId ||
      !input.treatmentName ||
      !input.customerName ||
      !input.customerEmail ||
      !input.customerPhone ||
      !input.paymentReference ||
      Number.isNaN(startsAt.valueOf()) ||
      !Number.isInteger(durationMinutes)
    )
      return NextResponse.json({ error: "Complete all booking details." }, { status: 400 });

    const bookings = await getBookings();
    const slotStillAvailable = getAvailableSlots({
      date: londonDateString(startsAt),
      durationMinutes,
      bookings,
      staff: staffMembers,
      branchId: input.branchId,
      serviceId: input.serviceId,
    }).includes(startsAt.toISOString());
    if (!slotStillAvailable)
      return NextResponse.json(
        { error: "That time has just been taken. Please choose another." },
        { status: 409 },
      );

    const eligible = availableStaffForStart({
      bookings,
      staff: staffMembers,
      branchId: input.branchId,
      serviceId: input.serviceId,
      startsAt,
      durationMinutes,
    });
    for (const member of eligible) {
      try {
        const booking = await createBooking({
          branchId: input.branchId,
          staffId: member.id,
          practitionerName: member.name,
          serviceId: input.serviceId,
          treatmentName: input.treatmentName,
          durationMinutes,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: "",
          marketingConsent: false,
          startsAt: startsAt.toISOString(),
          status: "confirmed",
          notes: `Customer self-booking after payment ${input.paymentReference}`,
        });
        const notification = await sendBookingNotification(booking, "booking-confirmation").catch(() => ({ sent: false }));
        return NextResponse.json(
          {
            booking: {
              id: booking.id,
              startsAt: booking.startsAt,
              endsAt: booking.endsAt,
              treatmentName: booking.treatmentName,
              branchId: booking.branchId,
            },
            notification,
          },
          { status: 201 },
        );
      } catch (error) {
        if (!(error instanceof BookingConflictError)) throw error;
      }
    }
    return NextResponse.json(
      { error: "That time has just been taken. Please choose another." },
      { status: 409 },
    );
  } catch (error) {
    if (error instanceof BookingValidationError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof BookingConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Could not create the appointment." }, { status: 500 });
  }
}
