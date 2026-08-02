import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getConsultations } from "@/lib/admin/storage";
export const dynamic = "force-dynamic";
export default async function Page() {
  const records = await getConsultations();
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">
          Clinical records
        </p>
        <h1 className="mt-2 font-display text-5xl">Consultation records</h1>
        <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white">
          {records.length ? (
            records.map((record) => (
              <Link
                key={record.id}
                href={`/admin/consultation-records/${record.id}`}
                className="flex justify-between border-b border-black/5 p-5 last:border-0 hover:bg-pink-light/30"
              >
                <span>
                  <strong>
                    {String(record.answers.fullName || "Unnamed customer")}
                  </strong>
                  <small className="mt-1 block text-black/45">
                    {record.templateTitle}
                  </small>
                </span>
                <span className="text-right">
                  <span className="rounded-full bg-pink-light px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-pink">
                    {String(record.answers.recordStatus || "draft").replaceAll("-", " ")}
                  </span>
                  <time className="mt-2 block text-xs text-black/40">
                    {new Date(record.createdAt).toLocaleString("en-GB")}
                  </time>
                </span>
              </Link>
            ))
          ) : (
            <p className="p-6 text-sm text-black/45">
              No consultation records saved yet.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
