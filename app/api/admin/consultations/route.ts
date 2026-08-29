import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  getConsultationTemplate,
  preserveLockedClientAnswers,
  validateConsultationAnswers,
} from "@/lib/admin/templates";
import {
  ConsultationStorageConfigurationError,
  saveConsultation,
  updateConsultationAnswers,
  updateConsultationImages,
  getConsultations,
} from "@/lib/admin/storage";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { createBooking } from "@/lib/admin/booking-storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      templateSlug?: string;
      answers?: Record<string, string | boolean | string[]>;
      images?: TreatmentImage[];
    };
    const template = body.templateSlug
      ? getConsultationTemplate(body.templateSlug)
      : undefined;
    if (!template || !body.answers)
      return NextResponse.json(
        { error: "Invalid consultation" },
        { status: 400 },
      );
    const validationErrors = validateConsultationAnswers(template, body.answers);
    if (validationErrors.length)
      return NextResponse.json({ error: "Consultation validation failed.", validationErrors }, { status: 400 });
    const record = await saveConsultation({
      id: randomUUID(),
      templateSlug: template.slug,
      templateTitle: template.title,
      createdAt: new Date().toISOString(),
      answers: body.answers,
      images: body.images || [],
    });
    const firstName = String(body.answers.firstName || "").trim();
    const lastName = String(body.answers.lastName || "").trim();
    const phone = String(body.answers.contactNumber || "").trim();
    if (firstName && lastName && phone && body.answers.recordStatus !== "draft")
      await createBooking({
        branchId: "reading-west-street",
        serviceId: "manual",
        treatmentName: `${template.title} consultation`,
        durationMinutes: 5,
        staffId: "manual",
        practitionerName: String(
          body.answers.practitionerName || "Consultation record",
        ),
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone,
        customerEmail: String(body.answers.email || ""),
        customerAddress: String(body.answers.address || ""),
        customerPostcode: String(body.answers.postcode || ""),
        customerGender: String(body.answers.gender || ""),
        marketingConsent: body.answers.marketingConsent === true,
        startsAt: new Date().toISOString(),
        status: "completed",
        notes: `Digital consultation saved: ${template.title}`,
        images: body.images || [],
      });
    return NextResponse.json({ saved: true, record });
  } catch (error) {
    if (error instanceof ConsultationStorageConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not save consultation." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      answers?: Record<string, string | boolean | string[]>;
      images?: TreatmentImage[];
    };
    if (!body.id || (!body.answers && !Array.isArray(body.images)))
      return NextResponse.json({ error: "Invalid consultation update." }, { status: 400 });
    const existing = body.answers ? (await getConsultations()).find((record) => record.id === body.id) : undefined;
    if (body.answers) {
      const template = existing ? getConsultationTemplate(existing.templateSlug) : undefined;
      if (!existing || !template) return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
      body.answers = preserveLockedClientAnswers(
        template,
        existing.answers,
        body.answers,
      );
      const validationErrors = validateConsultationAnswers(template, body.answers);
      if (validationErrors.length)
        return NextResponse.json({ error: "Consultation validation failed.", validationErrors }, { status: 400 });
    }
    let record = body.answers
      ? await updateConsultationAnswers(body.id, body.answers)
      : undefined;
    if (Array.isArray(body.images))
      record = await updateConsultationImages(body.id, body.images);
    if (existing && body.answers && existing.answers.recordStatus === "draft" && body.answers.recordStatus !== "draft") {
      const firstName = String(body.answers.firstName || "").trim();
      const lastName = String(body.answers.lastName || "").trim();
      const phone = String(body.answers.contactNumber || "").trim();
      if (firstName && lastName && phone)
        await createBooking({
          branchId: "reading-west-street", serviceId: "manual", treatmentName: `${existing.templateTitle} consultation`, durationMinutes: 5,
          staffId: "manual", practitionerName: String(body.answers.practitionerName || "Consultation record"), customerFirstName: firstName, customerLastName: lastName,
          customerPhone: phone, customerEmail: String(body.answers.email || ""), customerAddress: String(body.answers.address || ""), customerPostcode: String(body.answers.postcode || ""),
          customerGender: String(body.answers.gender || ""), marketingConsent: body.answers.marketingConsent === true, startsAt: new Date().toISOString(),
          status: "completed", notes: `Digital consultation finalised: ${existing.templateTitle}`, images: body.images || existing.images || [],
        });
    }
    return record ? NextResponse.json({ record }) : NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update consultation." }, { status: 500 });
  }
}
