import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { getConsultations } from "@/lib/admin/storage";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { getConsultationTemplate } from "@/lib/admin/templates";
import { staffMembers } from "@/lib/admin/booking-config";
import { getAdminTreatmentNames } from "@/lib/admin/lookup-options";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const record = (await getConsultations()).find((r) => r.id === id);
  if (!record) notFound();
  const template = getConsultationTemplate(record.templateSlug);
  if (!template) notFound();
  const treatmentNames = await getAdminTreatmentNames();
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
        <p className="mt-4 rounded-xl bg-pink-light/35 p-4 text-xs leading-5 text-black/60">
          All fields are optional. Add or update any available information and
          save the record again.
        </p>
        <div className="mt-7">
          <ConsultationForm
            template={template}
            practitionerNames={staffMembers.map((member) => member.name)}
            treatmentNames={treatmentNames}
            recordId={record.id}
            initialAnswers={record.answers}
            initialImages={record.images || []}
          />
        </div>
      </main>
    </>
  );
}
