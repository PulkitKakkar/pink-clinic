import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import { getBookings, updateBooking } from "@/lib/admin/booking-storage";
import { normalizePhoneNumber } from "@/lib/notifications/marketing-opt-out-utils";

export {
  isStopMessage,
  normalizePhoneNumber,
} from "@/lib/notifications/marketing-opt-out-utils";

const databaseUrl = process.env.DATABASE_URL;
const localFile = path.join(
  process.cwd(),
  "data",
  "admin",
  "marketing-opt-outs.json",
);
const globalDatabase = globalThis as unknown as {
  marketingOptOutSql?: ReturnType<typeof postgres>;
};
const sql = databaseUrl
  ? (globalDatabase.marketingOptOutSql ??
    postgres(databaseUrl, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: "require",
    }))
  : undefined;
if (sql && process.env.NODE_ENV !== "production")
  globalDatabase.marketingOptOutSql = sql;

export type MarketingOptOut = {
  id: string;
  phone: string;
  message: string;
  receivedAt: string;
  source: "sms";
};

async function readLocalOptOuts(): Promise<MarketingOptOut[]> {
  try {
    return JSON.parse(await readFile(localFile, "utf8")) as MarketingOptOut[];
  } catch {
    return [];
  }
}

async function recordOptOut(optOut: MarketingOptOut) {
  if (sql) {
    await sql`
      INSERT INTO marketing_sms_opt_outs (id, phone, message, source, received_at)
      VALUES (${optOut.id}, ${optOut.phone}, ${optOut.message}, ${optOut.source}, ${optOut.receivedAt})
    `;
    return;
  }
  const optOuts = await readLocalOptOuts();
  await mkdir(path.dirname(localFile), { recursive: true });
  const temporaryFile = `${localFile}.tmp`;
  await writeFile(
    temporaryFile,
    JSON.stringify([...optOuts, optOut], null, 2),
    "utf8",
  );
  await rename(temporaryFile, localFile);
}

export async function recordMarketingSmsOptOut(phone: string, message: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone)
    throw new Error("The incoming opt-out did not include a phone number.");
  const receivedAt = new Date().toISOString();
  const optOut: MarketingOptOut = {
    id: randomUUID(),
    phone: normalizedPhone,
    message: message.trim(),
    receivedAt,
    source: "sms",
  };
  await recordOptOut(optOut);

  const matchingBookings = (await getBookings()).filter(
    (booking) =>
      normalizePhoneNumber(booking.customerPhone) === normalizedPhone,
  );
  for (const booking of matchingBookings) {
    if (!booking.marketingConsent) continue;
    await updateBooking({
      id: booking.id,
      marketingConsent: false,
      marketingConsentUpdatedAt: receivedAt,
    });
  }
  return { optOut, updatedBookingCount: matchingBookings.length };
}

export async function isMarketingSmsAllowed(phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return false;
  if (sql) {
    const rows = await sql<{ opted_out: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM marketing_sms_opt_outs WHERE phone=${normalizedPhone}
      ) AS opted_out
    `;
    return !rows[0]?.opted_out;
  }
  return !(await readLocalOptOuts()).some(
    (item) => item.phone === normalizedPhone,
  );
}
