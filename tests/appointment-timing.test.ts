import { describe, expect, it } from "vitest";
import {
  getAppointmentSummary,
  isFutureAppointment,
} from "@/lib/admin/appointment-timing";
import { booking } from "./fixtures";

const now = new Date("2026-07-21T12:00:00.000Z").getTime();

describe("appointment timing", () => {
  it("labels only future confirmed bookings as future appointments", () => {
    expect(isFutureAppointment(booking(), now)).toBe(true);
    expect(isFutureAppointment(booking({ status: "cancelled" }), now)).toBe(false);
    expect(
      isFutureAppointment(booking({ startsAt: "2026-07-20T09:00:00.000Z" }), now),
    ).toBe(false);
  });

  it("selects the nearest future appointment and latest prior visit", () => {
    const later = booking({ id: "later", startsAt: "2026-07-28T09:00:00.000Z" });
    const next = booking({ id: "next" });
    const past = booking({
      id: "past",
      status: "completed",
      startsAt: "2026-07-20T09:00:00.000Z",
    });
    const cancelled = booking({
      id: "cancelled",
      status: "cancelled",
      startsAt: "2026-07-21T10:00:00.000Z",
    });

    expect(getAppointmentSummary([later, past, cancelled, next], now)).toEqual({
      nextAppointment: next,
      lastVisit: past,
    });
  });
});
