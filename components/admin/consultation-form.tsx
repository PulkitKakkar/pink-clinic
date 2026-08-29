"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ClipboardCheck, FilePenLine, LoaderCircle, X } from "lucide-react";
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

function isPractitionerSection(section: ConsultationTemplate["sections"][number]) {
  return section.audience === "practitioner" || /practitioner use only|complete at the treatment appointment|actual treatment session/i.test(section.description || "");
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
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "invalid" | "error">(
    "idle",
  );
  const [validationError, setValidationError] = useState("");
  const [images, setImages] = useState<TreatmentImage[]>(initialImages);
  const [activeRecordId, setActiveRecordId] = useState(recordId);
  const [selectedGender, setSelectedGender] = useState(String(initialAnswers.gender || ""));
  const datesSynchronized = useRef(false);
  const manuallySelectedFitzpatrick = useRef(new Set<string>());
  const today = new Date().toLocaleDateString("en-CA");
  const initialValue = (name: string) => initialAnswers[name];
  const [recordStatus, setRecordStatus] = useState(String(initialValue("recordStatus") || "draft"));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value || "draft";
    const fields = template.sections.flatMap((section) => section.fields);
    const visibleFields = fields.filter((field) => !field.hideWhen?.values.includes(String(form.get(field.hideWhen.field) || "")));
    const requiredFields = visibleFields.filter((field) => field.required || (intent === "complete" && field.completionRequired));
    const missingField = intent === "draft" ? undefined : requiredFields.find((field) =>
      field.type === "checkbox"
        ? form.get(field.id) !== "on"
        : field.type === "multi-checkbox"
          ? form.getAll(field.id).length === 0
          : !String(form.get(field.id) || "").trim(),
    );
    const unmetConditional = intent === "draft" ? undefined : template.conditionalRequirements?.find((rule) =>
      rule.values.includes(String(form.get(rule.whenField) || "")) && !String(form.get(rule.requiredField) || "").trim(),
    );
    const unmetDetailGroup = intent === "draft" ? undefined : template.detailGroups?.find((group) =>
      group.fields.some((fieldId) => form.get(fieldId) === "Yes") && !String(form.get(group.requiredField) || "").trim(),
    );
    const unexplainedYes = intent === "draft" ? undefined : fields.find((field, index) => {
      if (field.type !== "yes-no" || form.get(field.id) !== "Yes") return false;
      const next = fields[index + 1];
      return Boolean(next && ["text", "textarea"].includes(next.type) && /detail|explain|when|where|list/i.test(next.label) && !String(form.get(next.id) || "").trim());
    });
    const unexplainedOther = intent === "draft" ? undefined : fields.find((field, index) => {
      if (field.type !== "multi-checkbox" || !form.getAll(field.id).includes("Other")) return false;
      const next = fields[index + 1];
      return Boolean(next && /other/i.test(next.label) && !String(form.get(next.id) || "").trim());
    });
    const emergencyContactIncomplete = intent === "draft" ? false : Boolean(String(form.get("emergencyContact") || "").trim()) !== Boolean(String(form.get("emergencyContactNumber") || "").trim());
    const signatureMissing = intent !== "draft" && !String(form.get("signatureData") || "");
    const completionBlocker = intent === "complete" ? template.completionBlockers?.find((rule) => rule.values.includes(String(form.get(rule.field) || ""))) : undefined;
    if (missingField || unmetConditional || unmetDetailGroup || unexplainedYes || unexplainedOther || emergencyContactIncomplete || signatureMissing || completionBlocker) {
      setStatus("invalid");
      const unexplainedYesIndex = unexplainedYes ? fields.indexOf(unexplainedYes) : -1;
      const unexplainedOtherIndex = unexplainedOther ? fields.indexOf(unexplainedOther) : -1;
      const missingName = missingField?.id || unmetConditional?.requiredField || unmetDetailGroup?.requiredField || (unexplainedYesIndex >= 0 ? fields[unexplainedYesIndex + 1]?.id : "") || (unexplainedOtherIndex >= 0 ? fields[unexplainedOtherIndex + 1]?.id : "") || (emergencyContactIncomplete ? (!String(form.get("emergencyContact") || "").trim() ? "emergencyContact" : "emergencyContactNumber") : "") || completionBlocker?.field || "signatureData";
      setValidationError(
        unmetConditional?.message || unmetDetailGroup?.message || completionBlocker?.message ||
        (unexplainedYes ? `Add details for “${unexplainedYes.label}”.` : "") ||
        (unexplainedOther ? `Describe the Other selection for “${unexplainedOther.label}”.` : "") ||
        (emergencyContactIncomplete ? "Enter both the emergency contact name and number, or leave both blank." : "") ||
        (signatureMissing ? "Add the customer signature before finalising." : "") ||
        `Complete “${missingField?.label || "the required field"}”.`,
      );
      formElement.querySelector<HTMLElement>(`[name="${missingName}"]`)?.focus();
      return;
    }
    setValidationError("");
    setStatus("saving");
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
    answers.recordStatus = intent === "complete" ? "completed" : intent === "finalize" ? "ready-for-treatment" : recordStatus;
    answers.consentVersion = template.version || "2026-08-02";
    answers.lastUpdatedAt = new Date().toISOString();
    if (intent === "finalize" && !initialValue("consultationFinalizedAt"))
      answers.consultationFinalizedAt = new Date().toISOString();
    else if (initialValue("consultationFinalizedAt"))
      answers.consultationFinalizedAt = String(initialValue("consultationFinalizedAt"));
    if (intent === "complete") answers.treatmentCompletedAt = new Date().toISOString();
    else if (initialValue("treatmentCompletedAt")) answers.treatmentCompletedAt = String(initialValue("treatmentCompletedAt"));
    const response = await fetch("/api/admin/consultations", {
      method: activeRecordId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        activeRecordId
          ? { id: activeRecordId, answers, images }
          : { templateSlug: template.slug, answers, images },
      ),
    });
    const result = response.ok ? await response.json() : undefined;
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) setRecordStatus(String(answers.recordStatus));
    if (response.ok && !activeRecordId && result?.record?.id) setActiveRecordId(result.record.id);
  }

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    const target = event.target as unknown as HTMLInputElement;
    if (target.name === "gender") setSelectedGender(target.value);
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
      onSubmit={submit}
      onChange={handleChange}
      onInput={handleDateInput}
      className="grid gap-5"
    >
      {template.sections.map((section, sectionIndex) => (
        <div key={section.title} className="contents">
        <section
          className={`rounded-2xl border p-5 shadow-soft sm:p-7 ${isPractitionerSection(section) ? "border-pink/35 bg-pink-light/35 ring-1 ring-pink/10" : "border-black/5 bg-white"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl">{section.title}</h2>
            {isPractitionerSection(section) && <span className="rounded-full bg-pink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Practitioner use only</span>}
            {section === template.sections[0] && (
              <span className="rounded-full bg-pink-light px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink">
                {recordStatus.replaceAll("-", " ")}
              </span>
            )}
          </div>
          {section.description && (
            <p className="mt-2 text-sm text-black/55">{section.description}</p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {section.fields.filter((field) => !field.hideWhen?.values.includes(selectedGender)).map((field) => (
              <label
                key={field.id}
                className={`grid gap-2 text-xs font-bold ${field.type === "textarea" || field.type === "multi-checkbox" ? "sm:col-span-2" : ""}`}
              >
                {field.type !== "checkbox" && (
                  <span>
                    {field.label}
                    {field.showRequiredMarker !== false && (field.required || field.completionRequired) && <span className="ml-1 text-pink" aria-hidden="true">*</span>}
                  </span>
                )}
                {field.id === "address" ? (
                  <AddressLookup name={field.id} defaultValue={String(initialValue(field.id) || "")} />
                ) : ["practitionerName", "clinicianNameTitle"].includes(field.id) ? (
                  <SearchableOptionInput
                    name={field.id}
                    options={practitionerNames}
                    required={field.required}
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
                    required={field.required}
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
                  <span className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={field.label}>
                    {["No", "Yes"].map((value) => <span key={value} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium"><input name={field.id} value={value} type="radio" required={field.required} defaultChecked={initialValue(field.id) === value} className="accent-pink" />{value}</span>)}
                  </span>
                ) : field.type === "select" ? (
                  <select
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
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
                      required={field.required}
                      defaultChecked={initialValue(field.id) === true}
                      className="mt-1 accent-pink"
                    />
                    {field.label}
                  </span>
                ) : (
                  <input
                    name={field.id}
                    type={field.type}
                    required={field.required}
                    min={field.min}
                    max={field.max}
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
        {!isPractitionerSection(section) && template.sections[sectionIndex + 1] && isPractitionerSection(template.sections[sectionIndex + 1]) && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div><p className="font-bold text-green-900">Client section complete</p><p className="mt-1 text-xs leading-5 text-green-800/75">Save these answers before handing the form to your practitioner.</p></div>
            <button disabled={status === "saving"} formNoValidate name="submitIntent" value="draft" type="submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 sm:mt-0"><FilePenLine size={14} /> Save client section</button>
          </div>
        )}
        </div>
      ))}
      <section className="rounded-2xl border border-pink/35 bg-pink-light/35 p-5 shadow-soft sm:p-7">
        <TreatmentImages images={images} onChange={setImages} />
      </section>
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <SignaturePad defaultValue={String(initialValue("signatureData") || "")} />
      </section>
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
        <h2 className="font-display text-2xl">Customer agreement</h2>
        <label className="mt-4 flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5">
          <input
            name="termsAgreement"
            type="checkbox"
            required
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
              <CheckCircle2 size={16} /> Consultation {activeRecordId ? "updated" : "saved"}
            </span>
          ) : status === "invalid" ? (
            <span className="font-bold text-red-700">
              {validationError || "Complete all required fields marked with an asterisk."}
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
            activeRecordId
              ? "Update any details, then save the consultation record."
              : "Add the available details, then save the consultation record."
          )}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button disabled={status === "saving"} formNoValidate name="submitIntent" value="draft" type="submit" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold disabled:opacity-60">
            <FilePenLine size={14} /> Save draft
          </button>
          <button disabled={status === "saving"} name="submitIntent" value="finalize" type="submit" className="inline-flex items-center gap-2 rounded-full border border-pink px-4 py-2 text-xs font-bold text-pink disabled:opacity-60">
            <ClipboardCheck size={14} /> Finalize consultation
          </button>
        </div>
      </div>
      {status === "saved" && (
        <div role="dialog" aria-modal="true" aria-labelledby="save-success-title" className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-5">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10">
            <button type="button" onClick={() => setStatus("idle")} aria-label="Close confirmation" className="absolute right-4 top-4 rounded-full bg-cream p-2 text-black/60"><X size={20} /></button>
            <CheckCircle2 className="mx-auto text-green-600" size={68} strokeWidth={1.8} />
            <h2 id="save-success-title" className="mt-5 font-display text-4xl">Consultation {activeRecordId ? "updated" : "saved"}</h2>
            <p className="mt-3 text-sm leading-6 text-black/55">The consultation record has been saved successfully.</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-7 w-full rounded-full bg-pink px-6 py-3 text-sm font-bold text-white">Done</button>
          </div>
        </div>
      )}
    </form>
  );
}
