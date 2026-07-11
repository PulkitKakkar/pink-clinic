import Link from "next/link";
import {
  CalendarDays,
  MailCheck,
  MailX,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { AdminDatabaseError } from "@/components/admin/admin-database-error";
import { AdminHeader } from "@/components/admin/admin-header";
import { buildCustomerHistories } from "@/lib/admin/customer-history";
import { getBookings } from "@/lib/admin/booking-storage";
import { branches } from "@/lib/branches";
import { AddCustomerHistory } from "@/components/admin/add-customer-history";
import { EditCustomerRecord } from "@/components/admin/edit-customer-record";
import { CustomerTreatmentHistory } from "@/components/admin/customer-treatment-history";
import { EditTreatmentRecord } from "@/components/admin/edit-treatment-record";
import { CustomerSearch } from "@/components/admin/customer-search";

export const dynamic = "force-dynamic";

function treatmentSummary(
  bookings: import("@/lib/admin/booking-types").Booking[],
) {
  return bookings.map((booking) => ({
    name: booking.treatmentName,
    visits: 1,
    current: 0,
    total: 0,
  }));
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q || "").trim().toLowerCase();
  const result = await getBookings()
    .then((bookings) => ({
      customers: buildCustomerHistories(bookings),
      error: undefined,
    }))
    .catch((error) => ({ customers: [], error }));
  const allCustomers = result.customers;
  const customers = query
    ? allCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.replace(/\s/g, "").includes(query.replace(/\s/g, "")),
      )
    : allCustomers;
  const optedIn = allCustomers.filter((customer) => customer.marketingConsent);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-5 flex justify-end">
          <AddCustomerHistory customers={customers} />
        </div>
        <CustomerSearch customers={allCustomers} initialQuery={query} />
        <form className="hidden" action="/admin/customers">
          <label className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
              size={16}
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by customer name or phone number"
              className="w-full rounded-xl border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-pink"
            />
          </label>
          <button className="button-primary" type="submit">
            Search
          </button>
          {query && (
            <Link
              href="/admin/customers"
              className="inline-flex items-center rounded-xl border border-black/10 px-4 text-xs font-bold"
            >
              Clear
            </Link>
          )}
        </form>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">
              Customer records
            </p>
            <h1 className="mt-2 font-display text-5xl">Customer history</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
              View each customer&apos;s appointment history, treatment notes and
              GDPR promotional consent in one place. Future marketing exports
              should include opted-in customers only.
            </p>
          </div>
          <div className="grid gap-2 rounded-2xl border border-black/5 bg-white p-4 text-xs shadow-soft">
            <span className="font-bold text-black">
              {customers.length} customers
            </span>
            <span className="text-black/45">
              {optedIn.length} opted in for future promotions
            </span>
          </div>
        </div>
        {result.error ? (
          <div className="mt-8">
            <AdminDatabaseError error={result.error} />
          </div>
        ) : (
          <section className="mt-8 grid gap-4">
            {customers.length ? (
              customers.map((customer) => (
                <article
                  key={customer.id}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-pink-light text-pink">
                          <UserRound size={18} />
                        </span>
                        <div>
                          <h2 className="font-display text-3xl leading-none">
                            {customer.name}
                          </h2>
                          <p className="mt-1 text-xs text-black/40">
                            Last visit{" "}
                            {new Date(customer.lastVisitAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-black/50">
                        {customer.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} />
                            {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span className="inline-flex items-center gap-1.5">
                            {customer.email}
                          </span>
                        )}
                        {customer.address && (
                          <span className="basis-full text-black/45">
                            {customer.address}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <EditCustomerRecord customer={customer} />
                      <AddCustomerHistory
                        customers={allCustomers}
                        initialCustomerId={customer.id}
                        label="Add treatment record"
                      />
                      <div
                        className={`rounded-xl px-4 py-3 text-xs font-bold ${customer.marketingConsent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {customer.marketingConsent ? (
                          <span className="flex items-center gap-2">
                            <MailCheck size={15} />
                            Promotions allowed
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <MailX size={15} />
                            Do not send promotions
                          </span>
                        )}
                        <p className="mt-1 text-[10px] font-medium opacity-70">
                          {customer.marketingConsentUpdatedAt
                            ? `Recorded ${new Date(customer.marketingConsentUpdatedAt).toLocaleString("en-GB")}`
                            : "No consent record date"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CustomerTreatmentHistory
                    bookings={customer.bookings}
                    branches={branches}
                  />
                  <div className="hidden">
                    <div className="mt-5 rounded-xl bg-cream p-4">
                      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-pink">
                        Treatment overview
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {treatmentSummary(customer.bookings).map((item) => (
                          <span
                            key={item.name}
                            className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm"
                          >
                            {item.name}:{" "}
                            {item.total
                              ? `${item.current} of ${item.total} sessions`
                              : `${item.visits} ${item.visits === 1 ? "visit" : "visits"}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-black/40">
                      Treatment timeline · newest first
                    </p>
                    <div className="overflow-hidden rounded-xl border border-black/5">
                      {customer.bookings.map((booking) => {
                        const branch = branches.find(
                          (item) => item.id === booking.branchId,
                        );
                        return (
                          <div
                            key={booking.id}
                            className="grid gap-3 border-b border-black/5 p-4 last:border-0 md:grid-cols-[180px_minmax(0,1fr)]"
                          >
                            <div className="text-xs">
                              <p className="font-bold">
                                {new Date(booking.startsAt).toLocaleString(
                                  "en-GB",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                              <p className="mt-1 text-black/40">
                                {branch?.name || "Unknown branch"} ·{" "}
                                {booking.status}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                {booking.treatmentName}
                              </p>
                              <p className="mt-1 text-xs text-black/45">
                                Practitioner: {booking.practitionerName}
                              </p>
                              {booking.notes ? (
                                <p className="mt-3 rounded-lg bg-cream p-3 text-xs leading-5 text-black/60">
                                  {booking.notes}
                                </p>
                              ) : (
                                <p className="mt-3 text-xs text-black/30">
                                  No appointment notes recorded.
                                </p>
                              )}
                              <EditTreatmentRecord booking={booking} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-soft">
                <CalendarDays className="mx-auto text-pink" size={22} />
                <h2 className="mt-3 font-display text-3xl">
                  No customer history yet
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  Create bookings with customer details and appointment notes to
                  build this history.
                </p>
                <Link href="/admin/bookings" className="button-primary mt-5">
                  Create booking
                </Link>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
