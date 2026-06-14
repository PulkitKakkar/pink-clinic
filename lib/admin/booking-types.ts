export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no-show";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  branchIds: string[];
  serviceIds: string[];
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
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  notes: string;
  createdAt: string;
};

export type CreateBookingInput = Omit<Booking, "id" | "endsAt" | "createdAt">;
export type UpdateBookingInput = Partial<CreateBookingInput> & { id: string };
