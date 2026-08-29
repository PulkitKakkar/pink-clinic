import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getConsultations } from "@/lib/admin/storage";
import { consultationClientName, consultationStatus } from "@/lib/admin/consultation-display";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const records = await getConsultations();
  const draftOnly = (await searchParams).status === "draft";
  const visibleRecords = draftOnly
    ? records.filter((record) => consultationStatus(record.answers) === "draft")
    : records;
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">
          Clinical records
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl">{draftOnly ? "Draft consultations" : "Consultation records"}</h1>
            {draftOnly && <p className="mt-2 text-sm text-black/45">Continue and complete unfinished client consultations.</p>}
          </div>
          {draftOnly && <Link href="/admin/consultation-records" className="text-xs font-bold text-pink">View all records</Link>}
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white">
          {visibleRecords.length ? (
            visibleRecords.map((record) => {
              const status = consultationStatus(record.answers);
              const isDraft = status === "draft";
              return (
              <Link
                key={record.id}
                href={`/admin/consultation-records/${record.id}`}
                className={`flex justify-between border-b p-5 last:border-0 ${isDraft ? "border-pink/25 bg-pink-light/45 hover:bg-pink-light/70" : "border-black/5 hover:bg-pink-light/30"}`}
              >
                <span>
                  <strong>
                    {consultationClientName(record.answers)}
                  </strong>
                  <small className="mt-1 block text-black/45">
                    {record.templateTitle}
                  </small>
                </span>
                <span className="text-right">
                  <span className={isDraft ? "font-display text-3xl leading-none text-pink" : "rounded-full bg-pink-light px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-pink"}>
                    {status.replaceAll("-", " ").toUpperCase()}
                  </span>
                  <time className="mt-2 block text-xs text-black/40">
                    {new Date(record.createdAt).toLocaleString("en-GB")}
                  </time>
                </span>
              </Link>
            )})
          ) : (
            <p className="p-6 text-sm text-black/45">
              {draftOnly ? "No draft consultations. Everything is up to date." : "No consultation records saved yet."}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
