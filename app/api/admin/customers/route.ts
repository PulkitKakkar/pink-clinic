import { NextResponse } from "next/server";
import { getBookings, updateBooking } from "@/lib/admin/booking-storage";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { changedFields, logAdminActivity } from "@/lib/admin/activity-log";
import { formatLaserSettings, isValidLaserSettings, type LaserAreaSetting } from "@/lib/admin/laser-settings";

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
      amount?: string;
      laserAreas?: LaserAreaSetting[];
      bookingIds?: string[];
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      address?: string;
      postcode?: string;
      gender?: string;
      occupation?: string;
      dateOfBirth?: string;
      marketingConsent?: boolean;
      images?: TreatmentImage[];
    };
    const existing = await getBookings();
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
      const amount = body.amount?.trim();
      const isLaserTreatment = /laser/i.test(body.treatmentName);
      if (isLaserTreatment && (!Array.isArray(body.laserAreas) || !isValidLaserSettings(body.laserAreas)))
        return NextResponse.json({ error: "Add complete laser settings for every treatment area." }, { status: 400 });
      const laserSettings = isLaserTreatment ? formatLaserSettings(body.laserAreas!) : "";
      const booking = await updateBooking({
        id: body.bookingId,
        treatmentName: body.treatmentName,
        notes: `Session: ${body.sessionNumber || ""} of ${body.totalSessions || ""}\n\nConsultation:\n${body.consultation.trim()}\n\nOutcome:\n${body.outcome.trim()}${amount ? `\n\nAmount paid: £${Number(amount).toFixed(2)}` : ""}${laserSettings}`,
        images: body.images || [],
      });
      await logAdminActivity({ action: "updated", entity: "treatment record", entityId: booking.id, summary: `Treatment record updated for ${booking.customerName}`, changes: changedFields(existing.find((item) => item.id === booking.id) || {}, booking) });
      return NextResponse.json({ booking });
    }
    if (!body.bookingIds?.length || !body.firstName?.trim() || !body.lastName?.trim() || !body.phone?.trim())
      return NextResponse.json(
        { error: "Customer first name, last name, phone and record ids are required." },
        { status: 400 },
      );
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
          customerFirstName: body.firstName,
          customerLastName: body.lastName,
          customerPhone: body.phone,
          customerEmail: body.email || "",
          customerAddress: body.address || "",
          customerPostcode: body.postcode || "",
          customerGender: body.gender || "",
          customerOccupation: body.occupation || "",
          customerDateOfBirth: body.dateOfBirth || "",
          marketingConsent: Boolean(body.marketingConsent),
          marketingConsentUpdatedAt:
            booking.marketingConsent === Boolean(body.marketingConsent)
              ? booking.marketingConsentUpdatedAt
              : consentChangedAt,
        }),
      );
    }
    await logAdminActivity({
      action: "updated",
      entity: "customer",
      entityId: body.bookingIds[0],
      summary: `Customer details updated for ${bookings[0].customerName}`,
      changes: {
        recordsUpdated: bookings.map((booking) => ({
          recordId: booking.id,
          changes: changedFields(
            existing.find((item) => item.id === booking.id) || {},
            booking,
          ),
        })),
      },
    });
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
