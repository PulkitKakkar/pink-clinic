export type BookingIntent = {
  branchId?: string;
  branchSlug?: string;
  serviceSlug?: string;
  source?: string;
};

export interface BookingProvider {
  getBookingUrl(intent?: BookingIntent): string;
}
