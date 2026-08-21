import type { Booking, StaffMember } from "@/lib/admin/booking-types";

export const BOOKING_TIME_ZONE = "Europe/London";
export const SLOT_INTERVAL_MINUTES = 30;
export const OPENING_MINUTE = 9 * 60 + 30;
export const CLOSING_MINUTE = 18 * 60 + 30;
export const MINIMUM_BOOKING_NOTICE_MINUTES = 120;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BOOKING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateParts(date: Date) {
  const parts = dateFormatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function timeZoneOffset(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  ) - date.getTime();
}

export function londonDateTime(date: string, minuteOfDay: number) {
  const [year, month, day] = date.split("-").map(Number);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const approximate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const first = new Date(approximate.getTime() - timeZoneOffset(approximate));
  return new Date(approximate.getTime() - timeZoneOffset(first));
}

export function londonDateString(date: Date) {
  const { year, month, day } = dateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isBookableDate(date: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const start = londonDateTime(date, 0);
  if (Number.isNaN(start.valueOf())) return false;
  const today = londonDateTime(londonDateString(now), 0);
  const lastDay = new Date(today.getTime() + 60 * 24 * 60 * 60_000);
  return start >= today && start <= lastDay;
}

export function availableStaffForStart({
  bookings,
  staff,
  branchId,
  serviceId,
  startsAt,
  durationMinutes,
}: {
  bookings: Booking[];
  staff: StaffMember[];
  branchId: string;
  serviceId: string;
  startsAt: Date;
  durationMinutes: number;
}) {
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return staff.filter(
    (member) =>
      member.branchIds.includes(branchId) &&
      (serviceId.startsWith("catalog:") || member.serviceIds.includes(serviceId)) &&
      !bookings.some(
        (booking) =>
          booking.staffId === member.id &&
          booking.status === "confirmed" &&
          startsAt < new Date(booking.endsAt) &&
          endsAt > new Date(booking.startsAt),
      ),
  );
}

export function getAvailableSlots({
  date,
  durationMinutes,
  now = new Date(),
  ...availability
}: {
  date: string;
  durationMinutes: number;
  now?: Date;
  bookings: Booking[];
  staff: StaffMember[];
  branchId: string;
  serviceId: string;
}) {
  if (!isBookableDate(date, now) || durationMinutes < 5 || durationMinutes > 480)
    return [];
  const earliest = new Date(now.getTime() + MINIMUM_BOOKING_NOTICE_MINUTES * 60_000);
  const slots: string[] = [];
  for (
    let minute = OPENING_MINUTE;
    minute + durationMinutes <= CLOSING_MINUTE;
    minute += SLOT_INTERVAL_MINUTES
  ) {
    const startsAt = londonDateTime(date, minute);
    if (
      startsAt >= earliest &&
      availableStaffForStart({
        ...availability,
        startsAt,
        durationMinutes,
      }).length
    )
      slots.push(startsAt.toISOString());
  }
  return slots;
}
