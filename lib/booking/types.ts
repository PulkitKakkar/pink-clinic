export type BookingIntent = {
  serviceSlug?: string;
  locationSlug?: string;
  source?: string;
};

export interface BookingService {
  getBookingUrl(intent?: BookingIntent): string;
}
