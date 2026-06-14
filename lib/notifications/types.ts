import type { Booking } from "@/lib/admin/booking-types";

export type BookingNotificationType = "booking-confirmation" | "booking-updated" | "booking-cancelled" | "reminder-48-hours" | "reminder-24-hours";

export type BookingNotification = {
  id: string;
  type: BookingNotificationType;
  booking: Booking;
  subject: string;
  message: string;
  channels: Array<"email" | "sms">;
};

export interface NotificationProvider {
  send(notification: BookingNotification): Promise<void>;
}
