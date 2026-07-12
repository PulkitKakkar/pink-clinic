"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import type { ConsultationTemplate } from "@/lib/admin/templates";
import { AddressLookup } from "@/components/admin/address-lookup";
import { SignaturePad } from "@/components/admin/signature-pad";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";
const calculatedFields = new Set([
  "geneticDispositionScore",
  "sunExposureReactionScore",
  "tanningHabitsScore",
  "skinTypeTotalScore",
  "fitzpatrickType",
  "testPatchFitzpatrick",
  "bloodPressureClassification",
]);
const scoreGroups: Record<string, string[]> = {
  geneticDispositionScore: [
    "eyeColourScore",
    "naturalHairColourScore",
    "unexposedSkinColourScore",
    "frecklesScore",
  ],
  sunExposureReactionScore: [
    "sunReactionScore",
    "tanDegreeScore",
    "brownWithinHoursScore",
    "faceSunReactionScore",
  ],
  tanningHabitsScore: ["lastTanScore", "sunExposureFrequencyScore"],
};
function fitzpatrick(total: number) {
  if (total <= 7) return "I";
  if (total <= 16) return "II";
  if (total <= 24) return "III";
  if (total <= 30) return "IV";
  if (total <= 35) return "V";
  return "VI";
}

export function ConsultationForm({
  template,
}: {
  template: ConsultationTemplate;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [images, setImages] = useState<TreatmentImage[]>([]);

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
    answers.signatureData = String(form.get("signatureData") || "");
    const response = await fetch("/api/admin/consultations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateSlug: template.slug, answers, images }),
    });
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) { event.currentTarget.reset(); setImages([]); }
  }

  function calculateDerivedFields(form: HTMLFormElement) {
    const values = new FormData(form);
    const setValue = (name: string, value: string) => {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      if (field) field.value = value;
    };
    if (template.slug === "iv-therapy") {
      const systolic = Number(values.get("systolic"));
      const diastolic = Number(values.get("diastolic"));
      let classification = "";
      if (systolic > 0 && diastolic > 0) {
        classification =
          systolic < 90 || diastolic < 60
            ? "Low"
            : systolic >= 130 || diastolic >= 85
              ? "High"
              : systolic >= 121 || diastolic >= 81
                ? "Elevated"
                : "Normal";
      }
      setValue("bloodPressureClassification", classification);
      return;
    }
    if (template.slug !== "laser-device") return;
    const totals = Object.entries(scoreGroups).map(([target, names]) => {
      const complete = names.every((name) => values.get(name) !== "");
      const total = names.reduce(
        (sum, name) => sum + Number(values.get(name) || 0),
        0,
      );
      setValue(target, complete ? String(total) : "");
      return { complete, total };
    });
    const complete = totals.every((item) => item.complete);
    const total = totals.reduce((sum, item) => sum + item.total, 0);
    const type = complete ? fitzpatrick(total) : "";
    setValue("skinTypeTotalScore", complete ? String(total) : "");
    setValue("fitzpatrickType", type);
    setValue("testPatchFitzpatrick", type);
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      onChange={(event) => calculateDerivedFields(event.currentTarget)}
      className="grid gap-5"
    >
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
                ) : calculatedFields.has(field.id) ? (
                  <input
                    name={field.id}
                    required={field.required}
                    readOnly
                    aria-readonly="true"
                    className={`${inputClass} bg-pink-light/35 font-bold`}
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
        <SignaturePad />
      </section>
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <TreatmentImages images={images} onChange={setImages} />
      </section>
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
