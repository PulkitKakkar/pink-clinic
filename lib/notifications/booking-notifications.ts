import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import type { Booking } from "@/lib/admin/booking-types";
import { branches } from "@/lib/branches";
import { getNotificationProvider } from "@/lib/notifications/provider";
import type { BookingNotification, BookingNotificationType } from "@/lib/notifications/types";

const databaseUrl = process.env.DATABASE_URL;
const localFile = path.join(process.cwd(), "data", "admin", "booking-notifications.json");
const globalDatabase = globalThis as unknown as { notificationSql?: ReturnType<typeof postgres> };
const sql = databaseUrl ? globalDatabase.notificationSql ?? postgres(databaseUrl, { max: 3, idle_timeout: 20, connect_timeout: 10, ssl: process.env.NODE_ENV === "production" ? "require" : undefined }) : undefined;
if (sql && process.env.NODE_ENV !== "production") globalDatabase.notificationSql = sql;

type LocalDelivery = { key: string; status: "sent" | "failed"; error?: string; updatedAt: string };
type DeliveryClaim = { id: string; claimed: boolean };

function notificationCopy(booking: Booking, type: BookingNotificationType) {
  const branch = branches.find((item) => item.id === booking.branchId);
  const appointment = new Date(booking.startsAt).toLocaleString("en-GB", {
    timeZone: "Europe/London", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const details = `${booking.treatmentName} with ${booking.practitionerName} at ${branch?.name || "Pink Beauty Salon"} on ${appointment}.`;
  if (type === "booking-confirmation") return { subject: "Your Pink Beauty booking is confirmed", message: `Hi ${booking.customerName}, your booking is confirmed. ${details}` };
  if (type === "booking-updated") return { subject: "Your Pink Beauty booking has been updated", message: `Hi ${booking.customerName}, your booking has been updated. ${details}` };
  if (type === "booking-cancelled") return { subject: "Your Pink Beauty booking has been cancelled", message: `Hi ${booking.customerName}, your booking for ${booking.treatmentName} on ${appointment} has been cancelled. Please contact us if you need help.` };
  const timing = type === "reminder-48-hours" ? "in two days" : "tomorrow";
  return { subject: `Reminder: your Pink Beauty booking is ${timing}`, message: `Hi ${booking.customerName}, this is a reminder that your booking is ${timing}. ${details}` };
}

function buildNotification(booking: Booking, type: BookingNotificationType): BookingNotification {
  const channels: BookingNotification["channels"] = [];
  if (booking.customerEmail) channels.push("email");
  if (booking.customerPhone) channels.push("sms");
  return { id: randomUUID(), type, booking, channels, ...notificationCopy(booking, type) };
}

async function readLocalDeliveries(): Promise<LocalDelivery[]> {
  try { return JSON.parse(await readFile(localFile, "utf8")) as LocalDelivery[]; } catch { return []; }
}

async function claimDelivery(booking: Booking, type: BookingNotificationType): Promise<DeliveryClaim> {
  const id = randomUUID();
  if (sql) {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO booking_notification_deliveries (id, booking_id, notification_type, appointment_starts_at, status)
      VALUES (${id}, ${booking.id}, ${type}, ${booking.startsAt}, 'pending')
      ON CONFLICT (booking_id, notification_type, appointment_starts_at) DO UPDATE
        SET status='pending', error_message=NULL, updated_at=now()
        WHERE booking_notification_deliveries.status = 'failed'
      RETURNING id`;
    return { id: rows[0]?.id || id, claimed: Boolean(rows[0]) };
  }
  const deliveries = await readLocalDeliveries();
  const key = `${booking.id}:${type}:${booking.startsAt}`;
  if (deliveries.some((item) => item.key === key && item.status === "sent")) return { id, claimed: false };
  return { id: key, claimed: true };
}

async function finishDelivery(claim: DeliveryClaim, status: "sent" | "failed", error?: string) {
  if (sql) {
    await sql`UPDATE booking_notification_deliveries SET status=${status}, error_message=${error || null}, sent_at=${status === "sent" ? new Date() : null}, updated_at=now() WHERE id=${claim.id}`;
    return;
  }
  const deliveries = await readLocalDeliveries();
  const next = [...deliveries.filter((item) => item.key !== claim.id), { key: claim.id, status, error, updatedAt: new Date().toISOString() }];
  await mkdir(path.dirname(localFile), { recursive: true });
  const temporaryFile = `${localFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(next, null, 2), "utf8");
  await rename(temporaryFile, localFile);
}

export async function sendBookingNotification(booking: Booking, type: BookingNotificationType) {
  const notification = buildNotification(booking, type);
  if (!notification.channels.length) return { sent: false, reason: "Customer has no email address or phone number." };
  const claim = await claimDelivery(booking, type);
  if (!claim.claimed) return { sent: false, reason: "Notification already sent." };
  try {
    await getNotificationProvider().send(notification);
    await finishDelivery(claim, "sent");
    return { sent: true };
  } catch (error) {
    await finishDelivery(claim, "failed", error instanceof Error ? error.message : "Unknown provider error");
    throw error;
  }
}

export async function sendDueBookingReminders(bookings: Booking[], now = new Date()) {
  const results = [];
  for (const booking of bookings) {
    if (booking.status !== "confirmed") continue;
    const hoursUntil = (new Date(booking.startsAt).getTime() - now.getTime()) / 3_600_000;
    const type = hoursUntil > 24 && hoursUntil <= 48 ? "reminder-48-hours" : hoursUntil > 0 && hoursUntil <= 24 ? "reminder-24-hours" : undefined;
    if (!type) continue;
    try { results.push({ bookingId: booking.id, type, ...(await sendBookingNotification(booking, type)) }); }
    catch (error) { results.push({ bookingId: booking.id, type, sent: false, reason: error instanceof Error ? error.message : "Unknown provider error" }); }
  }
  return results;
}
