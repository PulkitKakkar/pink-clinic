"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import type { ConsultationTemplate } from "@/lib/admin/templates";
import { AddressLookup } from "@/components/admin/address-lookup";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";

export function ConsultationForm({
  template,
}: {
  template: ConsultationTemplate;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requiredFields = Array.from(
      event.currentTarget.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("[required]"),
    );
    const invalidFields = requiredFields.filter(
      (field) => !field.checkValidity(),
    );
    requiredFields.forEach((field) =>
      field.classList.toggle("border-red-500", invalidFields.includes(field)),
    );
    if (invalidFields.length) {
      setStatus("error");
      invalidFields[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("saving");
    const form = new FormData(event.currentTarget);
    const answers: Record<string, string | boolean | string[]> = {};
    template.sections
      .flatMap((section) => section.fields)
      .forEach((field) => {
        answers[field.id] =
          field.type === "checkbox"
            ? form.get(field.id) === "on"
            : field.type === "multi-checkbox"
              ? form.getAll(field.id).map(String)
              : String(form.get(field.id) || "");
      });
    answers.termsAgreement = form.get("termsAgreement") === "on";
    const response = await fetch("/api/admin/consultations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateSlug: template.slug, answers }),
    });
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5">
      {template.sections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7"
        >
          <h2 className="font-display text-2xl">{section.title}</h2>
          {section.description && (
            <p className="mt-2 text-sm text-black/55">{section.description}</p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <label
                key={field.id}
                className={`grid gap-2 text-xs font-bold ${field.type === "textarea" || field.type === "multi-checkbox" ? "sm:col-span-2" : ""}`}
              >
                {field.type !== "checkbox" && field.label}
                {field.id === "address" ? (
                  <AddressLookup name={field.id} />
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.id}
                    required={field.required}
                    rows={3}
                    className={inputClass}
                  />
                ) : field.type === "yes-no" ? (
                  <select
                    name={field.id}
                    required={field.required}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : field.type === "select" ? (
                  <select
                    name={field.id}
                    required={field.required}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "multi-checkbox" ? (
                  <span className="grid gap-2 rounded-xl border border-black/5 bg-cream p-4 sm:grid-cols-2">
                    {field.options?.map((option) => (
                      <span
                        key={option.value}
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <input
                          name={field.id}
                          value={option.value}
                          type="checkbox"
                          className="accent-pink"
                        />
                        {option.label}
                      </span>
                    ))}
                  </span>
                ) : field.type === "checkbox" ? (
                  <span className="flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5">
                    <input
                      name={field.id}
                      required={field.required}
                      type="checkbox"
                      className="mt-1 accent-pink"
                    />
                    {field.label}
                  </span>
                ) : (
                  <input
                    name={field.id}
                    required={field.required}
                    type={field.type}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <h2 className="font-display text-2xl">Customer agreement</h2>
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5">
          <input
            name="termsAgreement"
            required
            type="checkbox"
            className="mt-1 accent-pink"
          />
          <span>
            <strong className="block">
              I agree to Pink Beauty&apos;s consultation and treatment terms
            </strong>
            I confirm the information provided is accurate and understand this
            consultation record and my signature will be retained securely.
          </span>
        </label>
      </section>
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-luxe backdrop-blur">
        <p className="text-xs text-black/45">
          {status === "saved" ? (
            <span className="flex items-center gap-2 font-bold text-green-700">
              <CheckCircle2 size={16} /> Consultation saved
            </span>
          ) : status === "error" ? (
            <span className="font-bold text-red-700">
              Please complete all highlighted fields
            </span>
          ) : status === "saving" ? (
            <span className="flex items-center gap-2 font-bold text-pink">
              <LoaderCircle className="animate-spin" size={15} /> Saving
              consultation...
            </span>
          ) : (
            "Complete the form, then save the consultation record."
          )}
        </p>
        <button
          disabled={status === "saving"}
          type="submit"
          className="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "saving" ? (
            <LoaderCircle className="animate-spin" size={15} />
          ) : (
            <Save size={15} />
          )}
          {status === "saving" ? "Saving..." : "Save record"}
        </button>
      </div>
    </form>
  );
}
