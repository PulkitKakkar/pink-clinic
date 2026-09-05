import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { sql } from "@/lib/database";

export type ActivityLogEntry = {
  id: string;
  action: "created" | "updated" | "deleted";
  entity: string;
  entityId: string;
  summary: string;
  changes: Record<string, unknown>;
  actor: string;
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data", "admin");
const dataFile = path.join(dataDirectory, "activity-log.json");

type ActivityLogRow = {
  id: string;
  action: ActivityLogEntry["action"];
  entity: string;
  entity_id: string;
  summary: string;
  changes: Record<string, unknown>;
  actor: string;
  created_at: Date;
};

function fromRow(row: ActivityLogRow): ActivityLogEntry {
  return { id: row.id, action: row.action, entity: row.entity, entityId: row.entity_id, summary: row.summary, changes: row.changes || {}, actor: row.actor, createdAt: row.created_at.toISOString() };
}

export async function getActivityLog(limit = 200): Promise<ActivityLogEntry[]> {
  if (sql) {
    const rows = await sql<ActivityLogRow[]>`SELECT * FROM admin_activity_log ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 500)}`;
    return rows.map(fromRow);
  }
  try {
    return (JSON.parse(await readFile(dataFile, "utf8")) as ActivityLogEntry[]).slice(0, limit);
  } catch {
    return [];
  }
}

export async function logAdminActivity(input: Omit<ActivityLogEntry, "id" | "createdAt" | "actor"> & { actor?: string }) {
  const entry: ActivityLogEntry = { ...input, id: randomUUID(), actor: input.actor || "Admin portal", createdAt: new Date().toISOString() };
  if (sql) {
    await sql`INSERT INTO admin_activity_log (id, action, entity, entity_id, summary, changes, actor, created_at)
      VALUES (${entry.id}, ${entry.action}, ${entry.entity}, ${entry.entityId}, ${entry.summary}, ${sql.json(entry.changes as never)}, ${entry.actor}, ${entry.createdAt})`;
    return entry;
  }
  await mkdir(dataDirectory, { recursive: true });
  const existing = await getActivityLog(500);
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify([entry, ...existing].slice(0, 500), null, 2), "utf8");
  await rename(temporaryFile, dataFile);
  return entry;
}

export function changedFields(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.fromEntries(Object.keys(after).flatMap((key) => JSON.stringify(before[key]) === JSON.stringify(after[key]) ? [] : [[key, { from: before[key], to: after[key] }]]));
}
