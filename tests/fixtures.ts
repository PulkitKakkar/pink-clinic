import type { Booking } from "@/lib/admin/booking-types";

export function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    branchId: "reading-west-street",
    staffId: "staff-1",
    practitionerName: "Practitioner",
    serviceId: "manual",
    treatmentName: "Treatment",
    durationMinutes: 60,
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    customerPhone: "07123456789",
    customerAddress: "1 Test Street",
    customerGender: "",
    marketingConsent: false,
    marketingConsentUpdatedAt: null,
    startsAt: "2026-07-24T09:00:00.000Z",
    endsAt: "2026-07-24T10:00:00.000Z",
    status: "confirmed",
    notes: "",
    images: [],
    createdAt: "2026-07-21T09:00:00.000Z",
    ...overrides,
  };
}
