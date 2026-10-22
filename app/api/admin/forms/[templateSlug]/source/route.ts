import { observeApi } from "@/lib/observe-api";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getConsultationTemplate } from "@/lib/admin/templates";

async function handleGET(_: Request, { params }: { params: Promise<{ templateSlug: string }> }) {
  const template = getConsultationTemplate((await params).templateSlug);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const pdf = await readFile(path.join(process.cwd(), "private", "admin-forms", template.sourceFile));
  return new NextResponse(pdf, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${template.sourceFile}"`, "cache-control": "private, no-store" } });
}

export const GET = observeApi("/api/admin/forms/[templateSlug]/source", handleGET);
