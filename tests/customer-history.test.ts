import { describe, expect, it } from "vitest";
import {
  buildCustomerHistories,
  isRecordOnlyBooking,
} from "@/lib/admin/customer-history";
import { booking } from "./fixtures";

describe("customer history", () => {
  it("groups bookings by normalized email and keeps the latest consent decision", () => {
    const older = booking({
      id: "older",
      customerEmail: " CUSTOMER@example.com ",
      marketingConsent: true,
      marketingConsentUpdatedAt: "2026-07-20T09:00:00.000Z",
    });
    const newer = booking({
      id: "newer",
      customerEmail: "customer@example.com",
      startsAt: "2026-07-25T09:00:00.000Z",
      marketingConsent: false,
      marketingConsentUpdatedAt: "2026-07-21T09:00:00.000Z",
    });

    const histories = buildCustomerHistories([older, newer]);
    expect(histories).toHaveLength(1);
    expect(histories[0].bookings.map((item) => item.id)).toEqual(["newer", "older"]);
    expect(histories[0].marketingConsent).toBe(false);
  });

  it("keeps a previously recorded date of birth when the latest booking omits it", () => {
    const older = booking({
      id: "older",
      customerDateOfBirth: "1990-06-15",
      startsAt: "2026-07-20T09:00:00.000Z",
    });
    const newer = booking({
      id: "newer",
      customerDateOfBirth: "",
      startsAt: "2026-07-25T09:00:00.000Z",
    });

    expect(buildCustomerHistories([older, newer])[0].dateOfBirth).toBe("1990-06-15");
  });

  it("recognises manual historical records", () => {
    expect(
      isRecordOnlyBooking(
        booking({ status: "completed", practitionerName: "Historical record" }),
      ),
    ).toBe(true);
    expect(isRecordOnlyBooking(booking())).toBe(false);
  });
});
