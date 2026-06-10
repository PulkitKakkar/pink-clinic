import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type ConsultationRecord = {
  id: string;
  templateSlug: string;
  templateTitle: string;
  createdAt: string;
  answers: Record<string, string | boolean>;
};

const dataDirectory = path.join(process.cwd(), "data", "admin");
const dataFile = path.join(dataDirectory, "consultations.json");

export async function getConsultations(): Promise<ConsultationRecord[]> {
  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as ConsultationRecord[];
  } catch {
    return [];
  }
}

export async function saveConsultation(record: ConsultationRecord) {
  await mkdir(dataDirectory, { recursive: true });
  const existing = await getConsultations();
  await writeFile(dataFile, JSON.stringify([record, ...existing], null, 2), "utf8");
}
