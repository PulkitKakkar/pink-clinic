import { AdminHeader } from "@/components/admin/admin-header";
import { AdminDatabaseError } from "@/components/admin/admin-database-error";
import { BookingCalendar } from "@/components/admin/booking-calendar";
import { staffMembers } from "@/lib/admin/booking-config";
import { getBookings } from "@/lib/admin/booking-storage";
import {
  buildCustomerHistories,
  isRecordOnlyBooking,
} from "@/lib/admin/customer-history";
import { branches } from "@/lib/branches";
import { getBranchCatalog } from "@/lib/catalog";
import type { CalendarService } from "@/lib/admin/booking-types";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const [result, branchCatalogues] = await Promise.all([
    getBookings()
      .then((bookings) => ({ bookings, error: undefined }))
      .catch((error) => ({ bookings: [], error })),
    Promise.all(branches.map(async (branch) => ({
      branchId: branch.id,
      items: await getBranchCatalog(branch.slug),
    }))),
  ]);
  const catalogue = new Map<string, CalendarService>();
  for (const branchCatalogue of branchCatalogues) {
    for (const item of branchCatalogue.items) {
      const id = `catalog:${item.handle}`;
      const existing = catalogue.get(id);
      catalogue.set(id, {
        id,
        title: item.title,
        duration: existing?.duration || "60 min default",
        durationMinutes: existing?.durationMinutes || 60,
        branchIds: [...new Set([...(existing?.branchIds || []), branchCatalogue.branchId])],
        kind: item.kind,
      });
    }
  }
  const calendarServices = [...catalogue.values()].sort((a, b) =>
    a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title),
  );
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
            initialBookings={result.bookings.filter(
              (booking) => !isRecordOnlyBooking(booking),
            )}
            customers={buildCustomerHistories(result.bookings)}
            branches={branches}
            services={calendarServices}
            staff={staffMembers}
          />
        )}
      </main>
    </>
  );
}
