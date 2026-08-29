import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { getBookings } from "@/lib/admin/booking-storage";
import { buildCustomerHistories } from "@/lib/admin/customer-history";
import { consultationTemplates } from "@/lib/admin/templates";
import { getConsultations } from "@/lib/admin/storage";
import { consultationClientName, consultationStatus } from "@/lib/admin/consultation-display";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const records = await getConsultations();
  const draftCount = records.filter((record) => String(record.answers.recordStatus || "draft") === "draft").length;
  const customers = await getBookings()
    .then(buildCustomerHistories)
    .catch(() => []);
  const optedIn = customers.filter(
    (customer) => customer.marketingConsent,
  ).length;
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">
              Staff workspace
            </p>
            <h1 className="mt-2 font-display text-5xl">Admin dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">
              Manage staff-created bookings, customer histories and consent
              records from one protected workspace.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <Link
            href="/admin/bookings"
            className="rounded-2xl bg-pink p-5 text-white shadow-soft transition hover:-translate-y-1"
          >
            <CalendarDays size={20} />
            <strong className="mt-5 block text-3xl">Calendar</strong>
            <span className="text-xs text-white/70">
              Create and view bookings
            </span>
          </Link>
          <Link
            href="/admin/customers"
            className="rounded-2xl bg-white p-5 shadow-soft transition hover:-translate-y-1"
          >
            <Users className="text-pink" size={20} />
            <strong className="mt-5 block text-3xl">{customers.length}</strong>
            <span className="text-xs text-black/40">Customer histories</span>
            <span className="mt-2 block text-[10px] font-bold text-green-700">
              {optedIn} promotional opt-ins
            </span>
          </Link>
          <Link href="/admin/consultation-records?status=draft" className="group rounded-2xl border-2 border-pink bg-white p-5 shadow-[0_10px_30px_rgba(196,54,113,0.16)] transition hover:-translate-y-1 hover:bg-pink-light/25 hover:shadow-[0_14px_36px_rgba(196,54,113,0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink/25">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink text-white"><FileText size={20} /></span>
            <strong className="mt-4 block font-display text-4xl leading-none text-pink">
              {draftCount}
            </strong>
            <span className="mt-1 block text-sm font-bold text-black/70">Draft consultations</span>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-pink px-3 py-1.5 text-[10px] font-bold text-white">Continue drafts <ArrowRight size={12} className="transition group-hover:translate-x-1" /></span>
          </Link>
          <Link
            href="/admin/consultation-records"
            className="rounded-2xl bg-white p-5 shadow-soft transition hover:-translate-y-1"
          >
            <Users className="text-pink" size={20} />
            <strong className="mt-5 block text-3xl">{records.length}</strong>
            <span className="text-xs text-black/40">Consultation records</span>
          </Link>
        </div>
        <section className="mt-10">
          <h2 className="font-display text-3xl">Start a consultation</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {consultationTemplates.map((template) => (
              <Link
                key={template.slug}
                href={`/admin/consultations/${template.slug}`}
                className="group rounded-2xl border border-black/5 bg-white p-5 shadow-soft transition hover:-translate-y-1"
              >
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-pink">
                  Client consultation
                </p>
                <h3 className="mt-3 font-display text-2xl leading-none">
                  {template.title}
                </h3>
                <p className="mt-3 text-xs leading-5 text-black/45">
                  {template.description}
                </p>
                <span className="mt-5 flex items-center gap-2 text-xs font-bold text-pink">
                  Open form <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-3xl">Recent consultation records</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-black/5 bg-white">
            {records.length ? (
              records.slice(0, 10).map((record) => {
                const isDraft = consultationStatus(record.answers) === "draft";
                return (
                <Link
                  href={`/admin/consultation-records/${record.id}`}
                  key={record.id}
                  className={`flex items-center justify-between gap-4 border-b p-4 last:border-0 ${isDraft ? "border-pink/25 bg-pink-light/45 ring-inset hover:bg-pink-light/70" : "border-black/5 hover:bg-pink-light/20"}`}
                >
                  <div>
                    <p className="text-sm font-bold">
                      {consultationClientName(record.answers)}
                    </p>
                    <p className="mt-1 text-xs text-black/40">
                      {record.templateTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    {isDraft && <strong className="block font-display text-3xl leading-none text-pink">DRAFT</strong>}
                    <time className="mt-1 block text-[10px] uppercase tracking-[.12em] text-black/35">{new Date(record.createdAt).toLocaleString("en-GB")}</time>
                  </div>
                </Link>
              )})
            ) : (
              <p className="p-5 text-sm text-black/40">
                No consultation records saved yet.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
