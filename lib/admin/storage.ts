import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
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

type ConsultationRow = {
  id: string;
  template_slug: string;
  template_title: string;
  created_at: Date;
  answers: Record<string, string | boolean | string[]>;
  images?: TreatmentImage[];
};

const globalDatabase = globalThis as unknown as { consultationSql?: ReturnType<typeof postgres> };
const sql = databaseUrl
  ? globalDatabase.consultationSql ?? postgres(databaseUrl, { max: 5, idle_timeout: 20, connect_timeout: 10, ssl: process.env.NODE_ENV === "production" ? "require" : undefined })
  : undefined;
if (sql && process.env.NODE_ENV !== "production") globalDatabase.consultationSql = sql;

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

export async function saveConsultation(record: ConsultationRecord) {
  if (consultationStorageMode === "disabled") throw new ConsultationStorageConfigurationError("DATABASE_URL is required for production consultation storage.");
  if (sql) {
    const id = record.id || randomUUID();
    const rows = await sql<ConsultationRow[]>`
      INSERT INTO consultations (id, template_slug, template_title, answers, images)
      VALUES (${id}, ${record.templateSlug}, ${record.templateTitle}, ${sql.json(record.answers)}, ${sql.json(record.images)})
      RETURNING *`;
    return fromRow(rows[0]);
  }
  await mkdir(dataDirectory, { recursive: true });
  const existing = await getConsultations();
  await writeFile(dataFile, JSON.stringify([record, ...existing], null, 2), "utf8");
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
