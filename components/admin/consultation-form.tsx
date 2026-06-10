"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import type { ConsultationTemplate } from "@/lib/admin/templates";

const inputClass = "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";

export function ConsultationForm({ template }: { template: ConsultationTemplate }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const form = new FormData(event.currentTarget);
    const answers: Record<string, string | boolean> = {};
    template.sections.flatMap((section) => section.fields).forEach((field) => {
      answers[field.id] = field.type === "checkbox" ? form.get(field.id) === "on" : String(form.get(field.id) || "");
    });
    const response = await fetch("/api/admin/consultations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateSlug: template.slug, answers }) });
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return <form onSubmit={submit} className="grid gap-5">{template.sections.map((section) => <section key={section.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7"><h2 className="font-display text-2xl">{section.title}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{section.fields.map((field) => <label key={field.id} className={`grid gap-2 text-xs font-bold ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>{field.type !== "checkbox" && field.label}{field.type === "textarea" ? <textarea name={field.id} required={field.required} rows={3} className={inputClass} /> : field.type === "yes-no" ? <select name={field.id} required={field.required} className={inputClass}><option value="">Select</option><option value="No">No</option><option value="Yes">Yes</option></select> : field.type === "checkbox" ? <span className="flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5"><input name={field.id} required={field.required} type="checkbox" className="mt-1 accent-pink" />{field.label}</span> : <input name={field.id} required={field.required} type={field.type} className={inputClass} />}</label>)}</div></section>)}<div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-luxe backdrop-blur"><p className="text-xs text-black/45">{status === "saved" ? <span className="flex items-center gap-2 font-bold text-green-700"><CheckCircle2 size={16} /> Test consultation saved</span> : status === "error" ? <span className="font-bold text-red-700">Could not save consultation</span> : "Test data only. Do not enter real customer health data."}</p><button disabled={status === "saving"} type="submit" className="button-primary shrink-0"><Save size={15} />{status === "saving" ? "Saving..." : "Save record"}</button></div></form>;
}
