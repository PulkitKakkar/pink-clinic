import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getConsultationTemplate } from "@/lib/admin/templates";
import { ConsultationStorageConfigurationError, saveConsultation } from "@/lib/admin/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { templateSlug?: string; answers?: Record<string, string | boolean | string[]> };
    const template = body.templateSlug ? getConsultationTemplate(body.templateSlug) : undefined;
    if (!template || !body.answers) return NextResponse.json({ error: "Invalid consultation" }, { status: 400 });
    await saveConsultation({ id: randomUUID(), templateSlug: template.slug, templateTitle: template.title, createdAt: new Date().toISOString(), answers: body.answers });
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof ConsultationStorageConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Could not save consultation." }, { status: 500 });
  }
}
