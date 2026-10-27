"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ClipboardCheck, FilePenLine, LoaderCircle, X } from "lucide-react";
import {
  isPractitionerConsultationSection,
  getConsultationValidationIssues,
  type ConsultationTemplate,
} from "@/lib/admin/templates";
import { AddressLookup } from "@/components/admin/address-lookup";
import { SignaturePad } from "@/components/admin/signature-pad";
import { TreatmentImages } from "@/components/admin/treatment-images";
import type { TreatmentImage } from "@/lib/admin/booking-types";
import { useDraftAutosave } from "@/components/admin/use-draft-autosave";
import type { AutosaveResult } from "@/lib/admin/draft-autosave";
import { reportClientError } from "@/lib/admin/client-errors";
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

const isPractitionerSection = isPractitionerConsultationSection;

function readAnswers(template: ConsultationTemplate, form: FormData) {
  const answers: Record<string, string | boolean | string[]> = {};
  for (const field of template.sections.flatMap((section) => section.fields)) {
    answers[field.id] = field.type === "checkbox" ? form.get(field.id) === "on"
      : field.type === "multi-checkbox" ? form.getAll(field.id).map(String)
      : String(form.get(field.id) || "");
  }
  answers.termsAgreement = form.get("termsAgreement") === "on";
  answers.marketingConsent = form.get("marketingConsent") === "on";
  answers.signatureData = String(form.get("signatureData") || "");
  return answers;
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
  const formRef = useRef<HTMLFormElement>(null);
  const currentRecordId = useRef(recordId);
  const savedMetadata = useRef(initialAnswers);
  const imagesRef = useRef(initialImages);
  const manualInFlight = useRef(false);
  const [creationId] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "invalid" | "error">(
    "idle",
  );
  const [validationError, setValidationError] = useState("");
  const [issues, setIssues] = useState<{ field: string; message: string }[]>([]);
  const validationIntent = useRef<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  function collectIssues(form: HTMLFormElement, intent: string) {
    if (intent === "draft") return [];
    const answers = readAnswers(template, new FormData(form));
    answers.recordStatus = intent === "complete" ? "completed" : "ready-for-treatment";
    const result = getConsultationValidationIssues(template, answers);
    for (const control of Array.from(form.elements)) {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) continue;
      if (control.closest('[inert]') || !control.willValidate || control.validity.valid || result.some((issue) => issue.field === control.name)) continue;
      const field = template.sections.flatMap((section) => section.fields).find((field) => field.id === control.name);
      if (field?.hideWhen?.values.includes(String(answers[field.hideWhen.field] || ""))) continue;
      result.push({ field: control.name, message: `${field?.label || control.name}: ${control.validationMessage}` });
    }
    return result;
  }

  function focusField(name: string) {
    const form = formRef.current;
    const control = Array.from(form?.elements || []).find((element) => (element as HTMLInputElement).name === name) as HTMLElement | undefined;
    const container = document.getElementById(`consultation-field-${name}`);
    container?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    if (!control?.closest('[inert]')) control?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    for (const control of Array.from(form.elements)) {
      const name = (control as HTMLInputElement).name;
      if (issues.some((issue) => issue.field === name)) {
        control.setAttribute("aria-invalid", "true");
        control.setAttribute("aria-describedby", `consultation-error-${name}`);
      } else if (control.getAttribute("aria-invalid") === "true") {
        control.removeAttribute("aria-invalid");
        control.removeAttribute("aria-describedby");
      }
    }
  }, [issues]);

  useEffect(() => {
    if (status === "invalid" || status === "error") {
      errorSummaryRef.current?.focus();
      errorSummaryRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    }
  }, [status]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [images, setImages] = useState<TreatmentImage[]>(initialImages);
  const [activeRecordId, setActiveRecordId] = useState(recordId);
  const [selectedGender, setSelectedGender] = useState(String(initialAnswers.gender || ""));
  const [selectedProcedure, setSelectedProcedure] = useState(String(initialAnswers.procedureType || ""));
  const datesSynchronized = useRef(false);
  const manuallySelectedFitzpatrick = useRef(new Set<string>());
  const today = new Date().toLocaleDateString("en-CA");
  const defaultExpiryDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString("en-CA");
  })();
  const initialValue = (name: string) => initialAnswers[name];
  const [recordStatus, setRecordStatus] = useState(String(initialValue("recordStatus") || "draft"));
  const [clientSectionLocked, setClientSectionLocked] = useState(
    Boolean(initialValue("clientSectionCompletedAt")),
  );

  function adoptSavedRecord(id: string) {
    if (!currentRecordId.current && /^[a-f0-9-]{36}$/i.test(id)) {
      try { window.history.replaceState(window.history.state, "", `/admin/consultation-records/${id}`); }
      catch { /* The saved draft remains available in consultation records. */ }
    }
    currentRecordId.current = id;
    setActiveRecordId(id);
  }
  async function autosaveDraft(): Promise<AutosaveResult> {
    if (!formRef.current) return "error";
    const answers = readAnswers(template, new FormData(formRef.current));
    answers.recordStatus = "draft";
    answers.consentVersion = template.version || "2026-08-02";
    answers.lastUpdatedAt = new Date().toISOString();
    if (savedMetadata.current.clientSectionCompletedAt) answers.clientSectionCompletedAt = savedMetadata.current.clientSectionCompletedAt;
    try {
      const response = await fetch("/api/admin/consultations", {
        method: currentRecordId.current ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(currentRecordId.current ? { id: currentRecordId.current } : { templateSlug: template.slug, creationId }),
          autosave: true, answers, images: imagesRef.current,
        }),
      });
      if (response.status === 401) return "expired";
      if (response.status === 409) return "conflict";
      if (response.status === 400) return "invalid";
      const result = await response.json().catch(() => undefined);
      if (!response.ok || !result?.record?.id) {
        reportClientError(response.ok ? "invalid_response" : "server_response");
        return "error";
      }
      adoptSavedRecord(result.record.id);
      savedMetadata.current = result.record.answers || answers;
      return "saved";
    } catch {
      reportClientError("network");
      return "error";
    }
  }
  const autosave = useDraftAutosave(recordStatus === "draft", autosaveDraft);
  function updateImages(next: TreatmentImage[]) {
    imagesRef.current = next;
    setImages(next);
    autosave.markDirty();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (manualInFlight.current) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value || "draft";
    validationIntent.current = intent === "draft" ? null : intent;
    const nextIssues = collectIssues(formElement, intent);
    setIssues(nextIssues);
    if (nextIssues.length) {
      setStatus("invalid");
      setValidationError("");
      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
        errorSummaryRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      });
      return;
    }
    setValidationError("");
    setSessionExpired(false);
    setSaveError("");
    setStatus("saving");
    const answers = readAnswers(template, form);
    if (intent === "client-save")
      answers.clientSectionCompletedAt =
        String(savedMetadata.current.clientSectionCompletedAt || "") ||
        new Date().toISOString();
    else if (savedMetadata.current.clientSectionCompletedAt)
      answers.clientSectionCompletedAt = String(savedMetadata.current.clientSectionCompletedAt);
    answers.recordStatus = intent === "complete" ? "completed" : intent === "finalize" ? "ready-for-treatment" : recordStatus;
    answers.consentVersion = template.version || "2026-08-02";
    answers.lastUpdatedAt = new Date().toISOString();
    if (intent === "finalize" && !savedMetadata.current.consultationFinalizedAt)
      answers.consultationFinalizedAt = new Date().toISOString();
    else if (savedMetadata.current.consultationFinalizedAt)
      answers.consultationFinalizedAt = String(savedMetadata.current.consultationFinalizedAt);
    if (intent === "complete") answers.treatmentCompletedAt = new Date().toISOString();
    else if (savedMetadata.current.treatmentCompletedAt) answers.treatmentCompletedAt = String(savedMetadata.current.treatmentCompletedAt);
    manualInFlight.current = true;
    const version = await autosave.controller.prepareManualSave();
    let saved = false;
    try {
      const response = await fetch("/api/admin/consultations", {
        method: currentRecordId.current ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          currentRecordId.current
            ? { id: currentRecordId.current, answers, images }
            : { templateSlug: template.slug, creationId, answers, images },
        ),
      });
      if (response.status === 401) {
        setSessionExpired(true);
        setStatus("error");
        return;
      }
      const result = await response.json().catch(() => undefined);
      if (!response.ok) {
        if (response.status === 400 && Array.isArray(result?.validationErrors)) {
          setValidationError(result.validationErrors.filter((error: unknown) => typeof error === "string").join(" "));
          setStatus("invalid");
        } else {
          if (response.status !== 409) reportClientError("server_response");
          setSaveError(response.status === 409
            ? "This consultation has already been finalised in another save. Reopen the saved record before editing."
            : `Could not save the consultation. Keep this form open and try saving again.${typeof result?.requestId === "string" && /^[a-f0-9-]{36}$/i.test(result.requestId) ? ` Reference: ${result.requestId}` : ""}`);
          setStatus("error");
        }
        return;
      }
      if (!result?.record?.id) {
        reportClientError("invalid_response");
        setSaveError("The save response could not be confirmed. Keep this form open and try again.");
        setStatus("error");
        return;
      }
      saved = true;
      adoptSavedRecord(result.record.id);
      savedMetadata.current = result.record.answers || answers;
      setStatus("saved");
      setRecordStatus(String(answers.recordStatus));
      if (intent === "client-save") setClientSectionLocked(true);
      if (!activeRecordId && result?.record?.id) setActiveRecordId(result.record.id);
    } catch {
      reportClientError("network");
      setSaveError("The connection was interrupted. Keep this form open, check your connection and try saving again.");
      setStatus("error");
    } finally {
      manualInFlight.current = false;
      autosave.controller.finishManualSave(saved, version);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    autosave.markDirty();
    const target = event.target as unknown as HTMLInputElement;
    if (target.name === "procedureType") setSelectedProcedure(target.value);
    if (target.name === "gender") setSelectedGender(target.value);
    if (target.name === "fitzpatrickType" || target.name === "testPatchFitzpatrick") {
      manuallySelectedFitzpatrick.current.add(target.name);
    }
    calculateDerivedFields(event.currentTarget);
    if (validationIntent.current) setIssues(collectIssues(event.currentTarget, validationIntent.current));
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
        .forEach((field) => {
          if (!/expiry/i.test(field.name)) field.value = target.value;
        });
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

  const customerConsentSections = (
    <div
      className={clientSectionLocked ? "contents opacity-70" : "contents"}
      inert={clientSectionLocked}
    >
      <section id="consultation-field-termsAgreement" className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-soft sm:p-7 ${issues.some((issue) => issue.field === "termsAgreement") ? "border-red-500 ring-2 ring-red-500" : "border-black/5"}`}>
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
        {issues.find((issue) => issue.field === "termsAgreement") && <p id="consultation-error-termsAgreement" className="mt-2 text-xs font-bold text-red-700">Customer agreement is required.</p>}
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
      <section id="consultation-field-signatureData" className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-soft sm:p-7 ${issues.some((issue) => issue.field === "signatureData") ? "border-red-500 ring-2 ring-red-500" : "border-black/5"}`}>
        <SignaturePad defaultValue={String(initialValue("signatureData") || "")} onValueChange={() => {
          autosave.markDirty();
          requestAnimationFrame(() => { if (formRef.current && validationIntent.current) setIssues(collectIssues(formRef.current, validationIntent.current)); });
        }} />
        {issues.find((issue) => issue.field === "signatureData") && <p id="consultation-error-signatureData" className="mt-2 text-xs font-bold text-red-700">Customer signature is required.</p>}
      </section>
    </div>
  );
  const lastClientSectionIndex = template.sections.reduce(
    (lastIndex, section, index) => isPractitionerSection(section) ? lastIndex : index,
    -1,
  );
  const hasTreatmentImages = template.sections.some(
    (section) => section.treatmentImagesAfter,
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onChange={handleChange}
      onInput={handleDateInput}
      className="grid gap-5"
    >
      {(status === "invalid" || status === "error") && (
        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-red-500 bg-red-50 p-5 text-red-900 outline-none focus:ring-4 focus:ring-red-200 sm:p-7">
          <h2 className="text-lg font-bold">{status === "invalid" ? "The consultation needs your attention" : "The consultation could not be saved"}</h2>
          <p className="mt-2 text-sm">{status === "invalid" ? "Review the highlighted fields below, then try again. Finalisation has not been completed." : sessionExpired ? "Your staff sign-in has expired. Keep this form open—your answers and signature are still here. Sign in in a new tab, then save again." : saveError}</p>
          {sessionExpired && <a href="/admin/login?next=%2Fadmin" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold underline">Sign in in a new tab</a>}
          {validationError && <p className="mt-2 text-sm">{validationError}</p>}
          {issues.length > 0 && <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {issues.map((issue) => <li key={issue.field}><button type="button" onClick={() => focusField(issue.field)} className="text-left font-bold underline underline-offset-2">{issue.message}</button></li>)}
          </ul>}
        </div>
      )}
      <p className="text-xs text-black/60">Fields marked * are required to finalise. Missing answers, customer agreement and signature will be highlighted when you validate or finalise.</p>
      {template.sections.map((section, sectionIndex) => (
        <div key={section.title} className="contents">
        <section
          inert={clientSectionLocked && !isPractitionerSection(section)}
          className={`rounded-2xl border p-5 shadow-soft sm:p-7 ${isPractitionerSection(section) ? "border-pink/35 bg-pink-light/35 ring-1 ring-pink/10" : "border-black/5 bg-white"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl">
              {section.title}
              {section.audience === "client-consent" && (
                <span className="ml-1 text-pink" aria-hidden="true">
                  *
                </span>
              )}
            </h2>
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
            {section.fields.filter((field) => !(field.hideWhen?.field === "gender" && field.hideWhen.values.includes(selectedGender))).map((field) => {
              const groupedControl = field.type === "yes-no" || field.type === "multi-checkbox";
              const FieldContainer = groupedControl ? "fieldset" : "label";
              const FieldHeading = groupedControl ? "legend" : "span";
              return (
              <FieldContainer
                key={field.id}
                id={`consultation-field-${field.id}`}
                style={field.hideWhen?.field === "procedureType" && field.hideWhen.values.includes(selectedProcedure) ? { display: "none" } : undefined}
                className={`grid scroll-mt-24 gap-2 text-xs font-bold ${issues.some((issue) => issue.field === field.id) ? "rounded-xl border-2 border-red-500 bg-red-50 p-3" : ""} ${field.type === "textarea" || field.type === "multi-checkbox" ? "sm:col-span-2" : ""}`}
              >
                {field.type !== "checkbox" && (
                  <FieldHeading>
                    {field.label}
                    {!isPractitionerSection(section) && field.showRequiredMarker !== false && (field.required || field.completionRequired) && <span className="ml-1 inline-block align-middle text-pink" aria-hidden="true">*</span>}
                  </FieldHeading>
                )}
                {field.id === "address" ? (
                  <AddressLookup name={field.id} defaultValue={String(initialValue(field.id) || "")} />
                ) : ["practitionerName", "clinicianNameTitle"].includes(field.id) ? (
                  <SearchableOptionInput
                    name={field.id}
                    options={practitionerNames}
                    required={!isPractitionerSection(section) && field.required}
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
                    required={!isPractitionerSection(section) && field.required}
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
                    {["No", "Yes"].map((value) => <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium"><input name={field.id} value={value} type="radio" required={!isPractitionerSection(section) && field.required} defaultChecked={initialValue(field.id) === value} className="accent-pink" />{value}</label>)}
                  </span>
                ) : field.type === "select" ? (
                  <select
                    name={field.id}
                    defaultValue={String(initialValue(field.id) || "")}
                    required={!isPractitionerSection(section) && field.required}
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
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                      >
                        <input
                          name={field.id}
                          value={option.value}
                          type="checkbox"
                          defaultChecked={Array.isArray(initialValue(field.id)) && (initialValue(field.id) as string[]).includes(option.value)}
                          className="accent-pink"
                        />
                        {option.label}
                      </label>
                    ))}
                  </span>
                ) : field.type === "checkbox" ? (
                  <span className="flex items-start gap-3 rounded-xl bg-pink-light/45 p-4 text-sm leading-5">
                    <input
                      name={field.id}
                      type="checkbox"
                      required={!isPractitionerSection(section) && field.required}
                      defaultChecked={initialValue(field.id) === true}
                      className="mt-1 accent-pink"
                    />
                    <span>
                      {field.label}
                      {!isPractitionerSection(section) && field.showRequiredMarker !== false &&
                        (field.required || field.completionRequired) && (
                          <span className="ml-1 text-pink" aria-hidden="true">
                            *
                          </span>
                        )}
                    </span>
                  </span>
                ) : (
                  <input
                    name={field.id}
                    type={field.type}
                    required={!isPractitionerSection(section) && field.required}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    defaultValue={
                      String(initialValue(field.id) || "") ||
                      (!recordId && field.type === "date"
                        ? /expiry/i.test(field.id) || /expiry/i.test(field.label)
                          ? defaultExpiryDate
                          : field.id !== "dateOfBirth"
                            ? today
                            : undefined
                        : undefined)
                    }
                    className={inputClass}
                  />
                )}
                {issues.filter((issue) => issue.field === field.id).map((issue) => <span key={issue.field} id={`consultation-error-${field.id}`} className="text-xs font-bold text-red-700">{issue.message}</span>)}
              </FieldContainer>
              );
            })}
          </div>
        </section>
        {sectionIndex === lastClientSectionIndex && (
          <>
            {customerConsentSections}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div><p className="font-bold text-green-900">{clientSectionLocked ? "Client section saved and locked" : "Client section complete"}</p><p className="mt-1 text-xs leading-5 text-green-800/75">{clientSectionLocked ? "Customer answers can no longer be changed." : "Complete all required answers, consent and signature before handing the form to your practitioner."}</p></div>
              {!clientSectionLocked && <button disabled={status === "saving"} formNoValidate name="submitIntent" value="client-save" type="submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 sm:mt-0"><FilePenLine size={14} /> Validate and save client section</button>}
            </div>
            {hasTreatmentImages && (
              <section className="rounded-2xl border border-pink/35 bg-pink-light/35 p-5 shadow-soft sm:p-7">
                <TreatmentImages images={images} onChange={updateImages} />
              </section>
            )}
          </>
        )}
        </div>
      ))}
      <p aria-live="polite" className={`text-xs ${["expired", "conflict", "invalid", "error"].includes(autosave.state) ? "font-bold text-amber-800" : "text-black/50"}`}>
        {recordStatus !== "draft" ? "Finalised record: use the save buttons to save further changes."
          : autosave.state === "saving" ? "Saving draft in the background…"
          : autosave.state === "saved" ? "Draft autosaved. Required answers will be checked when you validate or finalise."
          : autosave.state === "expired" ? <>Autosave paused: your staff sign-in has expired. Keep this form open, <a href="/admin/login?next=%2Fadmin" target="_blank" rel="noopener noreferrer" className="underline">sign in in a new tab</a>, then return here to resume saving.</>
          : autosave.state === "conflict" ? "Autosave stopped: this record was finalised elsewhere. Reopen its saved record before editing."
          : autosave.state === "invalid" ? "Autosave paused. Use Save draft to see what needs attention. Your answers are still here."
          : autosave.state === "error" ? "Draft not autosaved. Keep this form open and check your connection. Saving will retry when you return to this tab or reconnect."
          : autosave.state === "unsaved" ? "Unsaved changes. Draft autosave will run shortly."
          : "Drafts save automatically as you fill in the form. Required fields apply when you validate or finalise."}
      </p>
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-luxe backdrop-blur">
        <p className="text-xs text-black/45">
          {status === "saved" ? (
            <span className="flex items-center gap-2 font-bold text-green-700">
              <CheckCircle2 size={16} /> Consultation {activeRecordId ? "updated" : "saved"}
            </span>
          ) : status === "invalid" ? (
            <span className="font-bold text-red-700">
              <button type="button" className="text-left underline" onClick={() => { errorSummaryRef.current?.focus(); errorSummaryRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" }); }}>{issues.length ? `${issues.length} field${issues.length === 1 ? "" : "s"} need attention. View highlighted fields.` : "Review the error summary above before trying again."}</button>
            </span>
          ) : status === "error" ? (
            <button type="button" className="text-left font-bold text-red-700 underline" onClick={() => { errorSummaryRef.current?.focus(); errorSummaryRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" }); }}>Save failed. View details above.</button>
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
