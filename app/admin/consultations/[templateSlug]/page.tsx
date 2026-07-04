import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { consultationStorageMode } from "@/lib/admin/storage";
import { getConsultationTemplate } from "@/lib/admin/templates";

export const dynamic = "force-dynamic";

export default async function ConsultationPage({ params }: { params: Promise<{ templateSlug: string }> }) {
  const template = getConsultationTemplate((await params).templateSlug);
  if (!template) notFound();
  return <><AdminHeader /><main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12"><Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={14} /> Admin dashboard</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">Client consultation</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{template.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-black/45">{template.description}</p></div><a href={`/api/admin/forms/${template.slug}/source`} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><FileDown size={15} /> Open original PDF</a></div>{consultationStorageMode === "disabled" ? <div className="mt-7 rounded-2xl border border-black/5 bg-white p-7 text-sm leading-6 text-black/55 shadow-soft">Digital consultation saving is not available yet. Please use the original PDF form for this consultation.</div> : <div className="mt-7"><ConsultationForm template={template} /></div>}</main></>;
}
