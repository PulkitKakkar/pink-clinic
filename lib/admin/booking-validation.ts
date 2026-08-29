import {
  getManualStaffId,
  getServiceDuration,
  MANUAL_SERVICE_ID,
  MANUAL_STAFF_ID,
  staffMembers,
} from "@/lib/admin/booking-config";
import type { CreateBookingInput } from "@/lib/admin/booking-types";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";
import { getBranchCatalog } from "@/lib/catalog";

export class BookingValidationError extends Error {}

function normalizeBoolean(value: unknown) {
  return (
    value === true || value === "true" || value === "on" || value === "yes"
  );
}

export async function normalizeBookingInput(
  input: CreateBookingInput,
  options: { requirePostcode?: boolean } = {},
) {
  const branch = branches.find((item) => item.id === input.branchId);
  const startsAt = new Date(input.startsAt);
  if (!branch || Number.isNaN(startsAt.valueOf()))
    throw new BookingValidationError("Invalid branch or start time.");
  if (!input.customerFirstName?.trim() || !input.customerLastName?.trim() || !input.customerPhone?.trim())
    throw new BookingValidationError(
      "Customer first name, last name and phone number are required.",
    );
  if (!input.customerAddress?.trim())
    throw new BookingValidationError("Customer address is required.");
  if (options.requirePostcode !== false && !input.customerPostcode?.trim())
    throw new BookingValidationError(
      "Customer postcode is required.",
    );
  const customerDateOfBirth = input.customerDateOfBirth?.trim() || "";
  if (
    customerDateOfBirth &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(customerDateOfBirth) ||
      Number.isNaN(new Date(`${customerDateOfBirth}T00:00:00Z`).valueOf()) ||
      new Date(`${customerDateOfBirth}T00:00:00Z`).toISOString().slice(0, 10) !==
        customerDateOfBirth ||
      customerDateOfBirth > new Date().toISOString().slice(0, 10))
  )
    throw new BookingValidationError("Enter a valid date of birth.");

  const configuredService = services.find(
    (item) => item.id === input.serviceId,
  );
  const isManualService = input.serviceId === MANUAL_SERVICE_ID;
  const isCatalogService = input.serviceId?.startsWith("catalog:");
  const catalogItem = isCatalogService
    ? (await getBranchCatalog(branch.slug)).find(
        (item) => `catalog:${item.handle}` === input.serviceId,
      )
    : undefined;
  const treatmentName = isManualService
    ? input.treatmentName?.trim()
    : catalogItem?.title || configuredService?.title;
  const durationMinutes =
    Number(input.durationMinutes) ||
    (isCatalogService ? 60 : getServiceDuration(input.serviceId));
  if (
    !treatmentName ||
    !durationMinutes ||
    durationMinutes < 5 ||
    durationMinutes > 480
  ) {
    throw new BookingValidationError(
      "Select a treatment, or enter its name and a duration between 5 and 480 minutes.",
    );
  }

  const configuredStaff = staffMembers.find(
    (item) => item.id === input.staffId,
  );
  const isManualStaff =
    input.staffId === MANUAL_STAFF_ID || input.staffId?.startsWith("manual:");
  const practitionerName = isManualStaff
    ? input.practitionerName?.trim()
    : configuredStaff?.name;
  const staffId =
    isManualStaff && practitionerName
      ? getManualStaffId(practitionerName)
      : configuredStaff?.id;
  if (!practitionerName || !staffId)
    throw new BookingValidationError(
      "Select a practitioner or enter their name.",
    );
  if (configuredStaff && !configuredStaff.branchIds.includes(branch.id))
    throw new BookingValidationError(
      "Selected practitioner does not work at this branch.",
    );
  if (
    configuredStaff &&
    !isManualService &&
    !isCatalogService &&
    !configuredStaff.serviceIds.includes(input.serviceId)
  )
    throw new BookingValidationError(
      "Selected practitioner cannot perform this treatment.",
    );

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return {
    ...input,
    staffId,
    practitionerName,
    serviceId: isManualService
      ? MANUAL_SERVICE_ID
      : isCatalogService
        ? input.serviceId
        : configuredService!.id,
    treatmentName,
    durationMinutes,
    customerName: `${input.customerFirstName.trim()} ${input.customerLastName.trim()}`,
    customerFirstName: input.customerFirstName.trim(),
    customerLastName: input.customerLastName.trim(),
    customerEmail: input.customerEmail?.trim() || "",
    customerPhone: input.customerPhone.trim(),
    customerAddress: input.customerAddress?.trim() || "",
    customerPostcode: input.customerPostcode?.trim().toUpperCase() || "",
    customerGender: input.customerGender?.trim() || "",
    customerOccupation: input.customerOccupation?.trim() || "",
    customerDateOfBirth,
    marketingConsent: normalizeBoolean(input.marketingConsent),
    marketingConsentUpdatedAt:
      input.marketingConsentUpdatedAt || new Date().toISOString(),
    notes: input.notes?.trim() || "",
    images: Array.isArray(input.images) ? input.images : [],
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}
