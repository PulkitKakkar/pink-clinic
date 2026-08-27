export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no-show";

export type TreatmentImage = {
  id: string;
  /** S3 object key. Older records may instead contain dataUrl. */
  key?: string;
  dataUrl?: string;
  phase: "before" | "after";
  name: string;
  contentType?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  branchIds: string[];
  serviceIds: string[];
};

export type CalendarService = {
  id: string;
  title: string;
  duration: string;
  durationMinutes: number;
  branchIds: string[];
  kind: "service" | "product" | "course";
};

export type Booking = {
  id: string;
  branchId: string;
  staffId: string;
  practitionerName: string;
  serviceId: string;
  treatmentName: string;
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGender: string;
  customerOccupation: string;
  customerDateOfBirth: string;
  marketingConsent: boolean;
  marketingConsentUpdatedAt: string | null;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  notes: string;
  images: TreatmentImage[];
  createdAt: string;
};

export type CreateBookingInput = Omit<
  Booking,
  "id" | "endsAt" | "createdAt" | "marketingConsentUpdatedAt" | "images" | "customerGender" | "customerOccupation" | "customerDateOfBirth"
> & { customerGender?: string; customerOccupation?: string; customerDateOfBirth?: string; marketingConsentUpdatedAt?: string | null; images?: TreatmentImage[] };
export type UpdateBookingInput = Partial<CreateBookingInput> & { id: string };
