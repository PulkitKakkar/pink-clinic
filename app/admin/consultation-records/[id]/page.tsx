import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { getConsultations } from "@/lib/admin/storage";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const record = (await getConsultations()).find((r) => r.id === id);
  if (!record) notFound();
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/admin/consultation-records"
          className="text-xs font-bold text-pink"
        >
          ← All consultation records
        </Link>
        <h1 className="mt-5 font-display text-4xl">
          {String(record.answers.fullName || "Unnamed customer")}
        </h1>
        <p className="mt-2 text-sm text-black/45">
          {record.templateTitle} ·{" "}
          {new Date(record.createdAt).toLocaleString("en-GB")}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {Object.entries(record.answers).map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl border border-black/5 bg-white p-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-pink">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              {key === "signatureData" && typeof value === "string" ? (
                <Image
                  src={value}
                  alt="Customer signature"
                  width={800}
                  height={240}
                  unoptimized
                  className="mt-3 max-h-48 rounded-xl border border-black/10 bg-white"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-black/65">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
