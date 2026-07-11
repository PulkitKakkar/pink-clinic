import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/lib/admin/booking-types";
import {
  BookingValidationError,
  normalizeBookingInput,
} from "@/lib/admin/booking-validation";

const dataDirectory = path.join(process.cwd(), "data", "admin");
const dataFile = path.join(dataDirectory, "bookings.json");
const databaseUrl = process.env.DATABASE_URL;
let writeQueue = Promise.resolve();

export class BookingConflictError extends Error {}
export class BookingConfigurationError extends Error {}
export { BookingValidationError };
export const bookingStorageMode = databaseUrl ? "postgres" : "local";

type BookingRow = {
  id: string;
  branch_id: string;
  staff_id: string;
  practitioner_name: string;
  service_id: string;
  treatment_name: string;
  duration_minutes: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  marketing_consent?: boolean;
  marketing_consent_updated_at?: Date | null;
  starts_at: Date;
  ends_at: Date;
  status: Booking["status"];
  notes: string;
  created_at: Date;
};

const globalDatabase = globalThis as unknown as {
  bookingSql?: ReturnType<typeof postgres>;
};
const sql = databaseUrl
  ? (globalDatabase.bookingSql ??
    postgres(databaseUrl, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
    }))
  : undefined;
if (sql && process.env.NODE_ENV !== "production")
  globalDatabase.bookingSql = sql;

function assertProductionStorage() {
  if (!sql && process.env.NODE_ENV === "production")
    throw new BookingConfigurationError(
      "DATABASE_URL is required for production booking storage.",
    );
}

function fromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    branchId: row.branch_id,
    staffId: row.staff_id,
    practitionerName: row.practitioner_name,
    serviceId: row.service_id,
    treatmentName: row.treatment_name,
    durationMinutes: row.duration_minutes,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address || "",
    marketingConsent: Boolean(row.marketing_consent),
    marketingConsentUpdatedAt:
      row.marketing_consent_updated_at?.toISOString() || null,
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at.toISOString(),
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
  };
}

function isConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23P01"
  );
}

async function getLocalBookings(): Promise<Booking[]> {
  try {
    const bookings = JSON.parse(await readFile(dataFile, "utf8")) as Booking[];
    return bookings.map((booking) => ({
      ...booking,
      marketingConsent: Boolean(booking.marketingConsent),
      marketingConsentUpdatedAt: booking.marketingConsentUpdatedAt || null,
      customerAddress: booking.customerAddress || "",
    }));
  } catch {
    return [];
  }
}

async function writeLocalBookings(bookings: Booking[]) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(bookings, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

function hasOverlap(
  bookings: Booking[],
  candidate: ReturnType<typeof normalizeBookingInput>,
  excludedId?: string,
) {
  return bookings.some(
    (booking) =>
      booking.id !== excludedId &&
      booking.staffId === candidate.staffId &&
      booking.status === "confirmed" &&
      new Date(candidate.startsAt) < new Date(booking.endsAt) &&
      new Date(candidate.endsAt) > new Date(booking.startsAt),
  );
}

export async function getBookings(): Promise<Booking[]> {
  assertProductionStorage();
  if (!sql) return getLocalBookings();
  const rows = await sql<
    BookingRow[]
  >`SELECT * FROM bookings ORDER BY starts_at`;
  return rows.map(fromRow);
}

export async function createBooking(input: CreateBookingInput) {
  const candidate = normalizeBookingInput(input);
  assertProductionStorage();
  if (sql) {
    try {
      const rows = await sql<BookingRow[]>`
        INSERT INTO bookings (id, branch_id, staff_id, practitioner_name, service_id, treatment_name, duration_minutes, customer_name, customer_email, customer_phone, customer_address, marketing_consent, marketing_consent_updated_at, starts_at, ends_at, status, notes)
        VALUES (${randomUUID()}, ${candidate.branchId}, ${candidate.staffId}, ${candidate.practitionerName}, ${candidate.serviceId}, ${candidate.treatmentName}, ${candidate.durationMinutes}, ${candidate.customerName}, ${candidate.customerEmail}, ${candidate.customerPhone}, ${candidate.customerAddress}, ${candidate.marketingConsent}, ${candidate.marketingConsentUpdatedAt}, ${candidate.startsAt}, ${candidate.endsAt}, ${candidate.status}, ${candidate.notes})
        RETURNING *`;
      return fromRow(rows[0]);
    } catch (error) {
      if (isConflict(error))
        throw new BookingConflictError(
          "This practitioner already has a booking during that time.",
        );
      throw error;
    }
  }

  const operation = writeQueue.then(async () => {
    const bookings = await getLocalBookings();
    if (hasOverlap(bookings, candidate))
      throw new BookingConflictError(
        "This practitioner already has a booking during that time.",
      );
    const booking: Booking = {
      ...candidate,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await writeLocalBookings(
      [...bookings, booking].sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
      ),
    );
    return booking;
  });
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function updateBooking(input: UpdateBookingInput) {
  const current = (await getBookings()).find(
    (booking) => booking.id === input.id,
  );
  if (!current) throw new BookingValidationError("Booking not found.");
  const candidate = normalizeBookingInput({ ...current, ...input });

  if (sql) {
    try {
      const rows = await sql<BookingRow[]>`
        UPDATE bookings SET branch_id=${candidate.branchId}, staff_id=${candidate.staffId}, practitioner_name=${candidate.practitionerName},
          service_id=${candidate.serviceId}, treatment_name=${candidate.treatmentName}, duration_minutes=${candidate.durationMinutes},
          customer_name=${candidate.customerName}, customer_email=${candidate.customerEmail}, customer_phone=${candidate.customerPhone}, customer_address=${candidate.customerAddress},
          marketing_consent=${candidate.marketingConsent}, marketing_consent_updated_at=${candidate.marketingConsentUpdatedAt},
          starts_at=${candidate.startsAt}, ends_at=${candidate.endsAt}, status=${candidate.status}, notes=${candidate.notes}, updated_at=now()
        WHERE id=${input.id} RETURNING *`;
      return fromRow(rows[0]);
    } catch (error) {
      if (isConflict(error))
        throw new BookingConflictError(
          "This practitioner already has a booking during that time.",
        );
      throw error;
    }
  }

  const operation = writeQueue.then(async () => {
    const bookings = await getLocalBookings();
    const index = bookings.findIndex((booking) => booking.id === input.id);
    if (index < 0) throw new BookingValidationError("Booking not found.");
    if (
      candidate.status === "confirmed" &&
      hasOverlap(bookings, candidate, input.id)
    )
      throw new BookingConflictError(
        "This practitioner already has a booking during that time.",
      );
    const updated: Booking = { ...bookings[index], ...candidate };
    bookings[index] = updated;
    await writeLocalBookings(
      bookings.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    );
    return updated;
  });
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function deleteBooking(id: string) {
  if (!id?.trim()) throw new BookingValidationError("Booking id is required.");
  assertProductionStorage();

  if (sql) {
    const rows = await sql<
      { id: string }[]
    >`DELETE FROM bookings WHERE id=${id} RETURNING id`;
    if (!rows.length) throw new BookingValidationError("Booking not found.");
    return { id };
  }

  const operation = writeQueue.then(async () => {
    const bookings = await getLocalBookings();
    const next = bookings.filter((booking) => booking.id !== id);
    if (next.length === bookings.length)
      throw new BookingValidationError("Booking not found.");
    await writeLocalBookings(next);
    return { id };
  });
  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}
