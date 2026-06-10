import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { bookingService } from "@/lib/booking";
import type { BookingIntent } from "@/lib/booking/types";

export function BookingLink({ intent, label = "Book appointment", className = "button-primary" }: { intent?: BookingIntent; label?: string; className?: string }) {
  return <Link href={bookingService.getBookingUrl(intent)} className={className}>{label}<ArrowUpRight size={16} /></Link>;
}
