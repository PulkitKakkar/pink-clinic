"use client";

import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import type { ConsultationTemplate } from "@/lib/admin/templates";
import { AddressLookup } from "@/components/admin/address-lookup";
import { SignaturePad } from "@/components/admin/signature-pad";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { SearchableOptionInput } from "@/components/admin/searchable-option-input";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-pink";
const calculatedFields = new Set([
  "geneticDispositionScore",
  "sunExposureReactionScore",
  "tanningHabitsScore",
  "skinTypeTotalScore",
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
  practitionerNames,
  treatmentNames,
  recordId,
  initialAnswers = {},
  initialImages = [],
}: {
  template: ConsultationTemplate;
  practitionerNames: string[];
  treatmentNames: string[];
  recordId?: string;
  initialAnswers?: Record<string, string | boolean | string[]>;
  initialImages?: TreatmentImage[];
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [images, setImages] = useState<TreatmentImage[]>(initialImages);
  const datesSynchronized = useRef(false);
  const manuallySelectedFitzpatrick = useRef(new Set<string>());
  const today = new Date().toLocaleDateString("en-CA");
  const initialValue = (name: string) => initialAnswers[name];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("saving");
    const form = new FormData(formElement);
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
    answers.marketingConsent = form.get("marketingConsent") === "on";
    answers.signatureData = String(form.get("signatureData") || "");
    const response = await fetch("/api/admin/consultations", {
      method: recordId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        recordId
          ? { id: recordId, answers, images }
          : { templateSlug: template.slug, answers, images },
      ),
    });
    setStatus(response.ok ? "saved" : "error");
    if (response.ok && !recordId) {
      formElement.reset();
      formElement.querySelectorAll<HTMLInputElement>('input[type="date"]:not([name="dateOfBirth"])').forEach((field) => { field.value = today; });
      datesSynchronized.current = false;
      manuallySelectedFitzpatrick.current.clear();
      setImages([]);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    const target = event.target as unknown as HTMLInputElement;
    if (target.name === "fitzpatrickType" || target.name === "testPatchFitzpatrick") {
      manuallySelectedFitzpatrick.current.add(target.name);
    }
    calculateDerivedFields(event.currentTarget);
  }

  function handleDateInput(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (
      !datesSynchronized.current &&
      target.type === "date" &&
      target.name !== "dateOfBirth" &&
      target.value
    ) {
      event.currentTarget
        .querySelectorAll<HTMLInputElement>('input[type="date"]:not([name="dateOfBirth"])')
        .forEach((field) => { field.value = target.value; });
      datesSynchronized.current = true;
    }
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
    if (!manuallySelectedFitzpatrick.current.has("fitzpatrickType"))
      setValue("fitzpatrickType", type);
    if (!manuallySelectedFitzpatrick.current.has("testPatchFitzpatrick"))
      setValue("testPatchFitzpatrick", type);
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      onChange={handleChange}
      onInput={handleDateInput}
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
                  <AddressLookup name={field.id} defaultValue={String(initialValue(field.id) || "")} />
                ) : ["practitionerName", "clinicianNameTitle"].includes(field.id) ? (
                  <SearchableOptionInput
                    name={field.id}
                    options={practitionerNames}
                    defaultValue={String(initialValue(field.id) || "")}
                    placeholder="Search practitioners or enter another name"
                    className={inputClass}
                  />
                ) : field.id === "treatmentAdministered" ? (
                  <SearchableOptionInput
                    name={field.id}
                    options={treatmentNames}
                    defaultValue={String(initialValue(field.id) || "")}
                    placeholder="Search treatments or enter another treatment"
                    className={inputClass}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
                    rows={3}
                    className={inputClass}
                  />
                ) : calculatedFields.has(field.id) ? (
                  <input
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
                    readOnly
                    aria-readonly="true"
                    className={`${inputClass} bg-pink-light/35 font-bold`}
                  />
                ) : field.type === "yes-no" ? (
                  <select
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : field.type === "select" ? (
                  <select
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
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
                          defaultChecked={Array.isArray(initialValue(field.id)) && (initialValue(field.id) as string[]).includes(option.value)}
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
                      type="checkbox"
                      defaultChecked={initialValue(field.id) === true}
                      className="mt-1 accent-pink"
                    />
                    {field.label}
                  </span>
                ) : (
                  <input
                    name={field.id}
                    type={field.type}
                    defaultValue={
                      String(initialValue(field.id) || "") ||
                      (!recordId && field.type === "date" && field.id !== "dateOfBirth"
                        ? today
                        : undefined)
                    }
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <SignaturePad defaultValue={String(initialValue("signatureData") || "")} />
      </section>
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <TreatmentImages images={images} onChange={setImages} />
      </section>
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <h2 className="font-display text-2xl">Customer agreement</h2>
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5">
          <input
            name="termsAgreement"
            type="checkbox"
            defaultChecked={initialValue("termsAgreement") === true}
            className="mt-1 accent-pink"
          />
          <span>
            <strong className="block">
              I agree to Pink Beauty&apos;s consultation and treatment terms
            </strong>
            I confirm the information provided is accurate and understand this
            consultation record and my signature will be retained securely. Read
            the <a href="/terms" target="_blank" className="font-bold text-pink underline">terms and conditions</a> and <a href="/privacy" target="_blank" className="font-bold text-pink underline">privacy policy</a>.
          </span>
        </label>
        <label className="mt-3 flex items-start gap-3 rounded-xl border border-black/5 bg-cream p-4 text-sm leading-5">
          <input
            name="marketingConsent"
            type="checkbox"
            defaultChecked={initialValue("marketingConsent") === true}
            className="mt-1 accent-pink"
          />
          <span>
            <strong className="block">I agree to receive promotional messages</strong>
            Pink Beauty may use my contact details to send offers and updates by
            SMS or email. This is optional and I can withdraw my consent at any
            time.
          </span>
        </label>
      </section>
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-luxe backdrop-blur">
        <p className="text-xs text-black/45">
          {status === "saved" ? (
            <span className="flex items-center gap-2 font-bold text-green-700">
              <CheckCircle2 size={16} /> Consultation {recordId ? "updated" : "saved"}
            </span>
          ) : status === "error" ? (
            <span className="font-bold text-red-700">
              Could not save the consultation. Please try again.
            </span>
          ) : status === "saving" ? (
            <span className="flex items-center gap-2 font-bold text-pink">
              <LoaderCircle className="animate-spin" size={15} /> Saving
              consultation...
            </span>
          ) : (
            recordId
              ? "Update any details, then save the consultation record."
              : "Add the available details, then save the consultation record."
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
          {status === "saving" ? "Saving..." : recordId ? "Update record" : "Save record"}
        </button>
      </div>
    </form>
  );
}
