import { NextResponse } from "next/server";
import { getBookings, updateBooking } from "@/lib/admin/booking-storage";
import type { TreatmentImage } from "@/lib/admin/booking-types";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "treatment";
      bookingId?: string;
      treatmentName?: string;
      consultation?: string;
      outcome?: string;
      sessionNumber?: string;
      totalSessions?: string;
      bookingIds?: string[];
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      gender?: string;
      marketingConsent?: boolean;
      images?: TreatmentImage[];
    };
    if (body.action === "treatment") {
      if (
        !body.bookingId ||
        !body.treatmentName?.trim() ||
        !body.consultation?.trim() ||
        !body.outcome?.trim()
      )
        return NextResponse.json(
          {
            error: "Treatment, consultation details and outcome are required.",
          },
          { status: 400 },
        );
      const booking = await updateBooking({
        id: body.bookingId,
        treatmentName: body.treatmentName,
        notes: `Session: ${body.sessionNumber || ""} of ${body.totalSessions || ""}\n\nConsultation:\n${body.consultation.trim()}\n\nOutcome:\n${body.outcome.trim()}`,
        images: body.images || [],
      });
      return NextResponse.json({ booking });
    }
    if (!body.bookingIds?.length || !body.name?.trim() || !body.phone?.trim())
      return NextResponse.json(
        { error: "Customer name, phone and record ids are required." },
        { status: 400 },
      );
    const existing = await getBookings();
    const ids = new Set(body.bookingIds);
    const matches = existing.filter((booking) => ids.has(booking.id));
    if (matches.length !== ids.size)
      return NextResponse.json(
        { error: "One or more customer records could not be found." },
        { status: 404 },
      );
    const consentChangedAt = new Date().toISOString();
    const bookings = [];
    for (const booking of matches) {
      bookings.push(
        await updateBooking({
          id: booking.id,
          customerName: body.name,
          customerPhone: body.phone,
          customerEmail: body.email || "",
          customerAddress: body.address || "",
          customerGender: body.gender || "",
          marketingConsent: Boolean(body.marketingConsent),
          marketingConsentUpdatedAt:
            booking.marketingConsent === Boolean(body.marketingConsent)
              ? booking.marketingConsentUpdatedAt
              : consentChangedAt,
        }),
      );
    }
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update customer record.",
      },
      { status: 500 },
    );
  }
}
