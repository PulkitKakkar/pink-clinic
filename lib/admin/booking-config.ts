import type { StaffMember } from "@/lib/admin/booking-types";
import { services } from "@/lib/content";

export const MANUAL_SERVICE_ID = "manual";
export const MANUAL_STAFF_ID = "manual";

export const staffMembers: StaffMember[] = [
  "Harpreet",
  "Blanch",
  "Vilma",
  "Humera",
  "Alisha",
  "Shaheen",
  "Chandni",
].map((name) => ({
  id: `staff-${name.toLowerCase()}`,
  name,
  role: "Beauty Practitioner",
  branchIds: ["reading-west-street", "reading-watlington-street"],
  serviceIds: services.map((service) => service.id),
}));

const serviceDurations: Record<string, number> = {
  hydrafacial: 60,
  "laser-hair-removal": 60,
  "skin-rejuvenation": 45,
  "anti-wrinkle-treatments": 30,
};

export function getServiceDuration(serviceId: string) {
  return serviceDurations[serviceId];
}

export function getManualStaffId(name: string) {
  return `manual:${name.trim().toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}
