import Link from "next/link";
import { ArrowLeft, FileDown, ShieldAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { consultationTemplates, getConsultationTemplate } from "@/lib/admin/templates";

export function generateStaticParams() {
  return consultationTemplates.map((template) => ({ templateSlug: template.slug }));
}

export default async function ConsultationPage({ params }: { params: Promise<{ templateSlug: string }> }) {
  const template = getConsultationTemplate((await params).templateSlug);
  if (!template) notFound();
  return <><AdminHeader /><main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12"><Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><ArrowLeft size={14} /> Admin dashboard</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-pink">Internal consultation</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{template.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-black/45">{template.description}</p></div><a href={`/api/admin/forms/${template.slug}/source`} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-pink"><FileDown size={15} /> Open original PDF</a></div><div className="my-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldAlert size={18} className="shrink-0" /><p><strong>Prototype for staff testing only.</strong> The digital fields are based on the supplied source form and require clinical and legal review before use with real customers.</p></div><ConsultationForm template={template} /></main></>;
}
