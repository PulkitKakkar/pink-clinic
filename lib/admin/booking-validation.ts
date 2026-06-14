import { getManualStaffId, getServiceDuration, MANUAL_SERVICE_ID, MANUAL_STAFF_ID, staffMembers } from "@/lib/admin/booking-config";
import type { CreateBookingInput } from "@/lib/admin/booking-types";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";

export class BookingValidationError extends Error {}

export function normalizeBookingInput(input: CreateBookingInput) {
  const branch = branches.find((item) => item.id === input.branchId);
  const startsAt = new Date(input.startsAt);
  if (!branch || Number.isNaN(startsAt.valueOf())) throw new BookingValidationError("Invalid branch or start time.");
  if (!input.customerName?.trim() || !input.customerPhone?.trim()) throw new BookingValidationError("Customer name and phone number are required.");

  const configuredService = services.find((item) => item.id === input.serviceId);
  const isManualService = input.serviceId === MANUAL_SERVICE_ID;
  const treatmentName = isManualService ? input.treatmentName?.trim() : configuredService?.title;
  const durationMinutes = isManualService ? Number(input.durationMinutes) : getServiceDuration(input.serviceId);
  if (!treatmentName || !durationMinutes || durationMinutes < 5 || durationMinutes > 480) {
    throw new BookingValidationError("Select a treatment, or enter its name and a duration between 5 and 480 minutes.");
  }

  const configuredStaff = staffMembers.find((item) => item.id === input.staffId);
  const isManualStaff = input.staffId === MANUAL_STAFF_ID || input.staffId?.startsWith("manual:");
  const practitionerName = isManualStaff ? input.practitionerName?.trim() : configuredStaff?.name;
  const staffId = isManualStaff && practitionerName ? getManualStaffId(practitionerName) : configuredStaff?.id;
  if (!practitionerName || !staffId) throw new BookingValidationError("Select a practitioner or enter their name.");
  if (configuredStaff && !configuredStaff.branchIds.includes(branch.id)) throw new BookingValidationError("Selected practitioner does not work at this branch.");
  if (configuredStaff && !isManualService && !configuredStaff.serviceIds.includes(input.serviceId)) throw new BookingValidationError("Selected practitioner cannot perform this treatment.");

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return {
    ...input,
    staffId,
    practitionerName,
    serviceId: isManualService ? MANUAL_SERVICE_ID : configuredService!.id,
    treatmentName,
    durationMinutes,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail?.trim() || "",
    customerPhone: input.customerPhone.trim(),
    notes: input.notes?.trim() || "",
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}
