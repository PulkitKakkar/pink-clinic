import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { sql } from "@/lib/database";
import type { TreatmentImage } from "@/lib/admin/booking-types";

export type ConsultationRecord = {
  id: string;
  templateSlug: string;
  templateTitle: string;
  createdAt: string;
  answers: Record<string, string | boolean | string[]>;
  images: TreatmentImage[];
};

const dataDirectory = path.join(process.cwd(), "data", "admin");
const dataFile = path.join(dataDirectory, "consultations.json");
const databaseUrl = process.env.DATABASE_URL;
export const consultationStorageMode = databaseUrl ? "postgres" : process.env.NODE_ENV === "production" ? "disabled" : "local-test";

export class ConsultationStorageConfigurationError extends Error {}
export class ConsultationConflictError extends Error {}

type ConsultationRow = {
  id: string;
  template_slug: string;
  template_title: string;
  created_at: Date;
  answers: Record<string, string | boolean | string[]>;
  images?: TreatmentImage[];
};

function fromRow(row: ConsultationRow): ConsultationRecord {
  return {
    id: row.id,
    templateSlug: row.template_slug,
    templateTitle: row.template_title,
    createdAt: row.created_at.toISOString(),
    answers: row.answers,
    images: row.images || [],
  };
}

export async function getConsultations(): Promise<ConsultationRecord[]> {
  if (consultationStorageMode === "disabled") return [];
  if (sql) {
    const rows = await sql<ConsultationRow[]>`SELECT * FROM consultations ORDER BY created_at DESC`;
    return rows.map(fromRow);
  }
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as ConsultationRecord[];
  } catch {
    return [];
  }
}

export async function getConsultation(id: string): Promise<ConsultationRecord | undefined> {
  if (sql) {
    const rows = await sql<ConsultationRow[]>`SELECT * FROM consultations WHERE id=${id}`;
    return rows[0] ? fromRow(rows[0]) : undefined;
  }
  return (await getConsultations()).find((record) => record.id === id);
}

export async function saveConsultation(record: ConsultationRecord, options: { idempotent?: boolean } = {}) {
  if (consultationStorageMode === "disabled") throw new ConsultationStorageConfigurationError("DATABASE_URL is required for production consultation storage.");
  if (sql) {
    const id = record.id || randomUUID();
    const rows = options.idempotent
      ? await sql<ConsultationRow[]>`
          INSERT INTO consultations (id, template_slug, template_title, answers, images)
          VALUES (${id}, ${record.templateSlug}, ${record.templateTitle}, ${sql.json(record.answers)}, ${sql.json(record.images)})
          ON CONFLICT (id) DO UPDATE SET answers=EXCLUDED.answers, images=EXCLUDED.images, updated_at=now()
          WHERE COALESCE(consultations.answers->>'recordStatus', 'draft') = 'draft'
            AND consultations.template_slug = EXCLUDED.template_slug
            AND (consultations.answers->>'clientSectionCompletedAt' IS NULL
              OR consultations.answers->>'clientSectionCompletedAt' = EXCLUDED.answers->>'clientSectionCompletedAt')
          RETURNING *`
      : await sql<ConsultationRow[]>`
          INSERT INTO consultations (id, template_slug, template_title, answers, images)
          VALUES (${id}, ${record.templateSlug}, ${record.templateTitle}, ${sql.json(record.answers)}, ${sql.json(record.images)})
          RETURNING *`;
    if (!rows.length) throw new ConsultationConflictError("This consultation has already been finalised. Reopen its saved record before editing.");
    return fromRow(rows[0]);
  }
  await mkdir(dataDirectory, { recursive: true });
  const existing = await getConsultations();
  const previous = existing.find((item) => item.id === record.id);
  if (previous && (!options.idempotent || previous.templateSlug !== record.templateSlug || (previous.answers.recordStatus || "draft") !== "draft"))
    throw new ConsultationConflictError("This consultation has already been finalised. Reopen its saved record before editing.");
  await writeFile(dataFile, JSON.stringify([record, ...existing.filter((item) => item.id !== record.id)], null, 2), "utf8");
  return record;
}

export async function updateConsultationImages(id: string, images: TreatmentImage[]) {
  if (consultationStorageMode === "disabled") throw new ConsultationStorageConfigurationError("DATABASE_URL is required for production consultation storage.");
  if (sql) {
    const rows = await sql<ConsultationRow[]>`UPDATE consultations SET images=${sql.json(images)}, updated_at=now() WHERE id=${id} RETURNING *`;
    return rows[0] ? fromRow(rows[0]) : undefined;
  }
  const existing = await getConsultations();
  const index = existing.findIndex((record) => record.id === id);
  if (index < 0) return undefined;
  existing[index] = { ...existing[index], images };
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(existing, null, 2), "utf8");
  return existing[index];
}

export async function updateConsultationAnswers(
  id: string,
  answers: ConsultationRecord["answers"],
  options: { images?: TreatmentImage[]; draftOnly?: boolean } = {},
) {
  if (consultationStorageMode === "disabled")
    throw new ConsultationStorageConfigurationError(
      "DATABASE_URL is required for production consultation storage.",
    );
  if (sql) {
    const rows = await sql<ConsultationRow[]>`
      UPDATE consultations
      SET answers=${sql.json(answers)}, images=COALESCE(${options.images ? sql.json(options.images) : null}::jsonb, images), updated_at=now()
      WHERE id=${id} AND (${!options.draftOnly} OR (
        COALESCE(answers->>'recordStatus', 'draft')='draft'
        AND (answers->>'clientSectionCompletedAt') IS NOT DISTINCT FROM ${String(answers.clientSectionCompletedAt || "") || null}
      ))
      RETURNING *`;
    return rows[0] ? fromRow(rows[0]) : undefined;
  }
  const existing = await getConsultations();
  const index = existing.findIndex((record) => record.id === id);
  if (index < 0) return undefined;
  if (options.draftOnly && (existing[index].answers.recordStatus || "draft") !== "draft") return undefined;
  existing[index] = { ...existing[index], answers, ...(options.images && { images: options.images }) };
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(existing, null, 2), "utf8");
  return existing[index];
}
