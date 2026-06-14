import { AdminHeader } from "@/components/admin/admin-header";
import { BookingCalendar } from "@/components/admin/booking-calendar";
import { staffMembers } from "@/lib/admin/booking-config";
import { bookingStorageMode, getBookings } from "@/lib/admin/booking-storage";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await getBookings();
  return <><AdminHeader /><main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12"><div className="mb-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">Staff workspace</p><h1 className="mt-2 font-display text-5xl">Bookings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">Create and edit appointments across both branches, with a combined weekly calendar. Overlapping appointments for the same practitioner are blocked by the server and production database.</p><div className={`mt-4 rounded-xl border p-3 text-xs leading-5 ${bookingStorageMode === "postgres" ? "border-green-200 bg-green-50 text-green-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><strong>{bookingStorageMode === "postgres" ? "Persistent PostgreSQL storage enabled." : "Local test storage enabled."}</strong>{bookingStorageMode === "local" && " Add DATABASE_URL and run the booking migration before deploying to production."}</div></div><BookingCalendar initialBookings={bookings} branches={branches} services={services} staff={staffMembers} /></main></>;
}
