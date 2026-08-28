import { describe, expect, it } from "vitest";
import {
  availableStaffForStart,
  getAvailableSlots,
  londonDateTime,
} from "@/lib/booking-availability";
import type { Booking, StaffMember } from "@/lib/admin/booking-types";

const staff: StaffMember[] = [
  { id: "one", name: "One", role: "Practitioner", branchIds: ["branch"], serviceIds: ["service"] },
  { id: "two", name: "Two", role: "Practitioner", branchIds: ["branch"], serviceIds: ["service"] },
];

function booking(staffId: string, start: string, end: string): Booking {
  return {
    id: `${staffId}-${start}`,
    branchId: "branch",
    staffId,
    practitionerName: staffId,
    serviceId: "service",
    treatmentName: "Treatment",
    durationMinutes: 60,
    customerName: "Customer",
    customerFirstName: "Test",
    customerLastName: "Customer",
    customerEmail: "customer@example.com",
    customerPhone: "07000000000",
    customerAddress: "",
    customerPostcode: "",
    customerGender: "",
    customerOccupation: "",
    customerDateOfBirth: "",
    marketingConsent: false,
    marketingConsentUpdatedAt: null,
    startsAt: start,
    endsAt: end,
    status: "confirmed",
    notes: "",
    images: [],
    createdAt: start,
  };
}

describe("customer booking availability", () => {
  it("creates slots in London opening hours and honours treatment duration", () => {
    const slots = getAvailableSlots({
      date: "2027-01-12",
      durationMinutes: 60,
      now: new Date("2027-01-01T12:00:00Z"),
      bookings: [],
      staff,
      branchId: "branch",
      serviceId: "service",
    });
    expect(slots[0]).toBe("2027-01-12T09:30:00.000Z");
    expect(slots.at(-1)).toBe("2027-01-12T17:30:00.000Z");
    expect(slots).toHaveLength(17);
  });

  it("keeps a slot available while any eligible practitioner is free", () => {
    const startsAt = londonDateTime("2027-06-12", 10 * 60);
    const endsAt = new Date(startsAt.getTime() + 60 * 60_000);
    const existing = [booking("one", startsAt.toISOString(), endsAt.toISOString())];
    expect(availableStaffForStart({ bookings: existing, staff, branchId: "branch", serviceId: "service", startsAt, durationMinutes: 60 }).map(({ id }) => id)).toEqual(["two"]);
    existing.push(booking("two", startsAt.toISOString(), endsAt.toISOString()));
    expect(availableStaffForStart({ bookings: existing, staff, branchId: "branch", serviceId: "service", startsAt, durationMinutes: 60 })).toHaveLength(0);
  });

  it("handles British Summer Time without shifting the customer time", () => {
    expect(londonDateTime("2027-06-12", 9 * 60 + 30).toISOString()).toBe("2027-06-12T08:30:00.000Z");
  });
});
