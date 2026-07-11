import { AdminHeader } from "@/components/admin/admin-header";
import { AdminDatabaseError } from "@/components/admin/admin-database-error";
import { BookingCalendar } from "@/components/admin/booking-calendar";
import { staffMembers } from "@/lib/admin/booking-config";
import { getBookings } from "@/lib/admin/booking-storage";
import { buildCustomerHistories } from "@/lib/admin/customer-history";
import { branches } from "@/lib/branches";
import { services } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const result = await getBookings()
    .then((bookings) => ({ bookings, error: undefined }))
    .catch((error) => ({ bookings: [], error }));
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">
            Staff workspace
          </p>
          <h1 className="mt-2 font-display text-5xl">Bookings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
            Create and edit appointments across both branches, with a combined
            weekly calendar, appointment notes and customer consent records.
          </p>
        </div>
        {result.error ? (
          <AdminDatabaseError error={result.error} />
        ) : (
          <BookingCalendar
            initialBookings={result.bookings}
            customers={buildCustomerHistories(result.bookings)}
            branches={branches}
            services={services}
            staff={staffMembers}
          />
        )}
      </main>
    </>
  );
}
