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
  getConsultation,
  ConsultationConflictError,
} from "@/lib/admin/storage";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { createBooking } from "@/lib/admin/booking-storage";
import { logApplicationEvent } from "@/lib/observability";
import { changedFields, logAdminActivity } from "@/lib/admin/activity-log";

const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function validAnswers(value: unknown): value is Record<string, string | boolean | string[]> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.values(value).every((entry) =>
    typeof entry === "string" || typeof entry === "boolean" || Array.isArray(entry) && entry.every((item) => typeof item === "string")));
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let autosave = false;
  try {
    const body = (await request.json()) as {
      templateSlug?: string;
      creationId?: string;
      autosave?: boolean;
      answers?: Record<string, string | boolean | string[]>;
      images?: TreatmentImage[];
    };
    autosave = body.autosave === true;
    if (body.creationId && !uuidPattern.test(body.creationId)) return NextResponse.json({ error: "Invalid draft identifier." }, { status: 400 });
    const template = body.templateSlug
      ? getConsultationTemplate(body.templateSlug)
      : undefined;
    if (!template || !validAnswers(body.answers))
      return NextResponse.json(
        { error: "Invalid consultation" },
        { status: 400 },
      );
    const existing = body.creationId ? await getConsultation(body.creationId) : undefined;
    if (existing && (existing.templateSlug !== template.slug || (existing.answers.recordStatus || "draft") !== "draft"))
      return NextResponse.json({ error: "This consultation has already been finalised. Reopen its saved record before editing." }, { status: 409 });
    if (autosave && (body.answers.recordStatus !== "draft" || body.answers.clientSectionCompletedAt && !existing?.answers.clientSectionCompletedAt))
      return NextResponse.json({ error: "Autosave can only save a draft; validate the client section explicitly." }, { status: 400 });
    if (existing) body.answers = preserveLockedClientAnswers(template, existing.answers, body.answers);
    const validationErrors = validateConsultationAnswers(template, body.answers);
    if (validationErrors.length) {
      logApplicationEvent("consultation_validation_failed", "WARN", { requestId, status: 400, validationCount: validationErrors.length });
      return NextResponse.json({ error: "Consultation validation failed.", validationErrors, requestId }, { status: 400 });
    }
    const record = await saveConsultation({
      id: body.creationId || randomUUID(),
      templateSlug: template.slug,
      templateTitle: template.title,
      createdAt: new Date().toISOString(),
      answers: body.answers,
      images: body.images || [],
    }, { idempotent: Boolean(body.creationId) });
    if (!autosave) await logAdminActivity({ action: "created", entity: "consultation", entityId: record.id, summary: `${template.title} consultation added`, changes: { after: record } });
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
    if (autosave) logApplicationEvent("consultation_autosave_succeeded", "INFO", { requestId, operation: "autosave", status: 200 });
    return NextResponse.json({ saved: true, record, requestId });
  } catch (error) {
    if (error instanceof ConsultationConflictError) return NextResponse.json({ error: error.message, requestId }, { status: 409 });
    logApplicationEvent("consultation_save_failed", "ERROR", { requestId, operation: autosave ? "autosave" : "create", status: 500, error });
    if (error instanceof ConsultationStorageConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json(
      { error: "Could not save consultation.", requestId },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const requestId = randomUUID();
  let autosave = false;
  try {
    const body = (await request.json()) as {
      id?: string;
      autosave?: boolean;
      answers?: Record<string, string | boolean | string[]>;
      images?: TreatmentImage[];
    };
    autosave = body.autosave === true;
    if (!body.id || !uuidPattern.test(body.id) || (body.answers !== undefined && !validAnswers(body.answers) || !body.answers && !Array.isArray(body.images)))
      return NextResponse.json({ error: "Invalid consultation update." }, { status: 400 });
    const existing = body.answers ? await getConsultation(body.id) : undefined;
    if (autosave && (!body.answers || body.answers.recordStatus !== "draft" || (existing && (existing.answers.recordStatus || "draft") !== "draft")))
      return NextResponse.json({ error: "Autosave stopped because this consultation is no longer a draft. Reopen the saved record before editing." }, { status: 409 });
    if (autosave && body.answers?.clientSectionCompletedAt && !existing?.answers.clientSectionCompletedAt)
      return NextResponse.json({ error: "Validate the client section explicitly." }, { status: 400 });
    if (body.answers) {
      const template = existing ? getConsultationTemplate(existing.templateSlug) : undefined;
      if (!existing || !template) return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
      body.answers = preserveLockedClientAnswers(
        template,
        existing.answers,
        body.answers,
      );
      const validationErrors = validateConsultationAnswers(template, body.answers);
      if (validationErrors.length) {
        logApplicationEvent("consultation_validation_failed", "WARN", { requestId, status: 400, validationCount: validationErrors.length });
        return NextResponse.json({ error: "Consultation validation failed.", validationErrors, requestId }, { status: 400 });
      }
    }
    let record = body.answers
      ? await updateConsultationAnswers(body.id, body.answers, { images: body.images, draftOnly: autosave })
      : undefined;
    if (!body.answers && Array.isArray(body.images))
      record = await updateConsultationImages(body.id, body.images);
    if (record && !autosave)
      await logAdminActivity({ action: "updated", entity: "consultation", entityId: record.id, summary: `${record.templateTitle} consultation updated`, changes: changedFields(existing || {}, record) });
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
    if (autosave && !record) return NextResponse.json({ error: "Autosave stopped because this consultation changed. Reopen its saved record." }, { status: 409 });
    if (autosave) logApplicationEvent("consultation_autosave_succeeded", "INFO", { requestId, operation: "autosave", status: 200 });
    return record ? NextResponse.json({ record, requestId }) : NextResponse.json({ error: "Consultation not found." }, { status: 404 });
  } catch (error) {
    logApplicationEvent("consultation_save_failed", "ERROR", { requestId, operation: autosave ? "autosave" : "update", status: 500, error });
    return NextResponse.json({ error: "Could not update consultation.", requestId }, { status: 500 });
  }
}
