import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getConsultationTemplate } from "@/lib/admin/templates";
import {
  ConsultationStorageConfigurationError,
  saveConsultation,
} from "@/lib/admin/storage";
import { createBooking } from "@/lib/admin/booking-storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      templateSlug?: string;
      answers?: Record<string, string | boolean | string[]>;
    };
    const template = body.templateSlug
      ? getConsultationTemplate(body.templateSlug)
      : undefined;
    if (!template || !body.answers)
      return NextResponse.json(
        { error: "Invalid consultation" },
        { status: 400 },
      );
    await saveConsultation({
      id: randomUUID(),
      templateSlug: template.slug,
      templateTitle: template.title,
      createdAt: new Date().toISOString(),
      answers: body.answers,
    });
    const fullName = String(body.answers.fullName || "").trim();
    const phone = String(body.answers.contactNumber || "").trim();
    if (fullName && phone)
      await createBooking({
        branchId: "reading-west-street",
        serviceId: "manual",
        treatmentName: `${template.title} consultation`,
        durationMinutes: 5,
        staffId: "manual",
        practitionerName: String(
          body.answers.practitionerName || "Consultation record",
        ),
        customerName: fullName,
        customerPhone: phone,
        customerEmail: String(body.answers.email || ""),
        customerAddress: String(body.answers.address || ""),
        marketingConsent: false,
        startsAt: new Date().toISOString(),
        status: "completed",
        notes: `Digital consultation saved: ${template.title}`,
      });
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof ConsultationStorageConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not save consultation." },
      { status: 500 },
    );
  }
}
