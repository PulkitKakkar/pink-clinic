import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { consultationTemplates, getConsultationTemplate, validateConsultationAnswers } from "@/lib/admin/templates";
import { consultationClientName, consultationStatus } from "@/lib/admin/consultation-display";

describe("consultation templates", () => {
  it("uses split client names and defaults unfinished records to draft", () => {
    const answers = { firstName: "Harpreet", lastName: "Batra" };
    expect(consultationClientName(answers)).toBe("Harpreet Batra");
    expect(consultationStatus(answers)).toBe("draft");
  });

  it("includes all requested treatment and service consultation forms", () => {
    const requestedSlugs = [
      "hydrafacial", "carbon-peel-facial", "tattoo-removal", "ipl-skin-rejuvenation",
      "microdermabrasion", "morpheus8", "dermaplaning", "prp-hair-face",
      "skin-eye-boosters", "intramuscular-injections", "facial", "waxing-hot-waxing",
      "pedicure-manicure", "lash-brow-tint", "hair-colour", "ear-piercing",
    ];

    expect(consultationTemplates).toHaveLength(24);
    expect(consultationTemplates.map((template) => template.slug)).toEqual(expect.arrayContaining(requestedSlugs));
  });

  it("asks occupation and referral source on every consultation form", () => {
    for (const template of consultationTemplates) {
      const ids = template.sections.flatMap((section) => section.fields.map((field) => field.id));
      expect(ids, template.slug).toEqual(expect.arrayContaining(["occupation", "referralSource"]));
    }
  });

  it("keeps routine service forms concise and removes irrelevant clinical fields", () => {
    const briefSlugs = ["facial", "waxing-hot-waxing", "pedicure-manicure", "lash-brow-tint", "hair-colour", "ear-piercing"];
    for (const slug of briefSlugs) {
      const fields = getConsultationTemplate(slug)!.sections.flatMap((section) => section.fields);
      const ids = fields.map((field) => field.id);
      expect(ids, slug).not.toEqual(expect.arrayContaining(["gender", "address", "emergencyContact", "gpDetails", "settingsDose", "marketingPhotographyConsent"]));
      expect(fields.find((field) => field.id === "decisionNotes")?.required, slug).not.toBe(true);
    }
  });

  it("uses focused rather than blanket medical screening on the new advanced forms", () => {
    const advancedSlugs = ["hydrafacial", "carbon-peel-facial", "tattoo-removal", "ipl-skin-rejuvenation", "microdermabrasion", "morpheus8", "dermaplaning", "prp-hair-face", "skin-eye-boosters", "intramuscular-injections"];
    for (const slug of advancedSlugs) {
      const ids = getConsultationTemplate(slug)!.sections.flatMap((section) => section.fields.map((field) => field.id));
      expect(ids, slug).not.toEqual(expect.arrayContaining(["hrtContraception", "asthma", "oedema", "tattoosMoles", "anxietyMentalHealth"]));
    }
  });

  it("uses unique field identifiers within every form", () => {
    for (const template of consultationTemplates) {
      const ids = template.sections.flatMap((section) => section.fields.map((field) => field.id));
      expect(new Set(ids).size, template.slug).toBe(ids.length);
    }
  });

  it("uses valid option sets and field identifiers in every form", () => {
    for (const template of consultationTemplates) {
      for (const field of template.sections.flatMap((section) => section.fields)) {
        expect(field.id, `${template.slug}: ${field.label}`).toMatch(/^[a-z][A-Za-z0-9]*$/);
        if (field.type === "select" || field.type === "multi-checkbox") {
          expect(field.options?.length, `${template.slug}: ${field.id}`).toBeGreaterThan(0);
          const values = field.options?.map((option) => option.value) || [];
          expect(new Set(values).size, `${template.slug}: ${field.id}`).toBe(values.length);
          expect(values.every((value) => value.trim().length > 0), `${template.slug}: ${field.id}`).toBe(true);
        }
      }
    }
  });

  it("renders every configured field in every digital form", () => {
    for (const template of consultationTemplates) {
      const html = renderToStaticMarkup(
        createElement(ConsultationForm, {
          template,
          practitionerNames: ["Test Practitioner"],
          treatmentNames: ["Test Treatment"],
        }),
      );
      for (const field of template.sections.flatMap((section) => section.fields)) {
        expect(html, `${template.slug}: ${field.id}`).toContain(`name="${field.id}"`);
      }
      expect(html).toContain('name="signatureData"');
      expect(html).toContain('name="termsAgreement"');
      expect(html).toContain('name="marketingConsent"');
    }
  });

  it("links every template to an existing PDF source", () => {
    for (const template of consultationTemplates) {
      const sourcePath = path.join(process.cwd(), "private", "admin-forms", template.sourceFile);
      expect(existsSync(sourcePath), template.slug).toBe(true);
      expect(readFileSync(sourcePath).subarray(0, 5).toString(), template.slug).toBe("%PDF-");
    }
  });

  it("versions every consent template and supports completed-treatment sign-off", () => {
    for (const template of consultationTemplates) {
      const fields = template.sections.flatMap((section) => section.fields);
      expect(template.version, template.slug).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(fields.some((field) => field.completionRequired), template.slug).toBe(true);
      expect(fields.some((field) => field.id === "practitionerDeclaration" && field.completionRequired), template.slug).toBe(true);
      expect(fields.some((field) => field.id === "practitionerSignatureName" && field.completionRequired), template.slug).toBe(true);
    }
  });

  it.each(["anti-wrinkle", "dermal-fillers", "skin-peel-microneedling", "lemon-bottle", "spmu", "laser-device"])(
    "%s separates clinical and marketing photography consent",
    (slug) => {
      const ids = getConsultationTemplate(slug)?.sections.flatMap((section) => section.fields.map((field) => field.id));
      const clinicalIds = ["clinicalPhotographyConsent", "internalPhotoConsent"];
      const marketingIds = ["marketingPhotographyConsent", "marketingPhotoConsent"];
      expect(ids?.some((id) => clinicalIds.includes(id))).toBe(true);
      expect(ids?.some((id) => marketingIds.includes(id))).toBe(true);
    },
  );

  it("adds the recommended treatment traceability records", () => {
    const expected: Record<string, string[]> = {
      "anti-wrinkle": ["diluentDetails", "reconstitutionDateTime", "areasTreated"],
      "dermal-fillers": ["needleCannulaDetails", "anaestheticDetails", "emergencyPlanDiscussed"],
      "skin-peel-microneedling": ["treatmentProductTraceability", "infectionControlCheck", "needleDevice"],
      "iv-therapy": ["infusionTiming", "cannulaRecord", "postObservations"],
      mounjaro: ["doseGiven", "batchNumber", "expiryDate", "administrationRouteSite", "responseAndSideEffects"],
      "lemon-bottle": ["supplierProductVerification", "batchNumber", "injectionRecord"],
      spmu: ["pigmentTraceability", "needleCartridgeTraceability", "infectionControlCheck"],
      "laser-device": ["deviceDetails", "treatmentAreasSettings", "treatmentEndpoint"],
    };
    for (const [slug, requiredIds] of Object.entries(expected)) {
      const ids = getConsultationTemplate(slug)?.sections.flatMap((section) => section.fields.map((field) => field.id));
      expect(ids, slug).toEqual(expect.arrayContaining(requiredIds));
    }
  });

  it("uses bounded numeric fields for stress and baseline IV observations", () => {
    const allFields = consultationTemplates.flatMap((template) => template.sections.flatMap((section) => section.fields));
    for (const id of ["workStress", "homeStress", "systolic", "diastolic", "baselinePulse", "baselineSpO2"]) {
      const matches = allFields.filter((field) => field.id === id);
      expect(matches.length, id).toBeGreaterThan(0);
      expect(matches.every((field) => typeof field.min === "number" && typeof field.max === "number"), id).toBe(true);
    }
  });

  it("allows incomplete drafts but rejects unsigned final records", () => {
    const template = getConsultationTemplate("anti-wrinkle")!;
    expect(validateConsultationAnswers(template, { recordStatus: "draft" })).toEqual([]);
    expect(validateConsultationAnswers(template, { recordStatus: "ready-for-treatment" })).toContain("Customer signature is required.");
  });

  it("blocks treatment completion when a patch test is pending", () => {
    const template = getConsultationTemplate("laser-device")!;
    const errors = validateConsultationAnswers(template, { recordStatus: "completed", result: "Pending" });
    expect(errors).toContain("Laser treatment cannot be completed while the patch test is positive or pending.");
  });

  it("renders draft and finalize actions without treatment completion", () => {
    const template = getConsultationTemplate("iv-therapy")!;
    const html = renderToStaticMarkup(createElement(ConsultationForm, { template, practitionerNames: [], treatmentNames: [] }));
    expect(html).toContain('value="draft"');
    expect(html).toContain('value="finalize"');
    expect(html).not.toContain('value="complete"');
    expect(html).not.toContain("Complete treatment");
  });

  it.each(["anti-wrinkle", "dermal-fillers"])(
    "%s includes the comprehensive injectable safety record",
    (slug) => {
      const template = getConsultationTemplate(slug);
      const ids = template?.sections.flatMap((section) => section.fields.map((field) => field.id));

      expect(ids).toEqual(expect.arrayContaining([
        "medicalHistoryDetails",
        "suitabilityOutcome",
        "ageEligibilityConfirmed",
        "clinicalPhotographyConsent",
        "marketingPhotographyConsent",
        "productName",
        "batchNumber",
        "expiryDate",
        "aftercareGiven",
        "followUpDate",
      ]));
    },
  );

  it("records filler-specific vascular risk consent", () => {
    const ids = getConsultationTemplate("dermal-fillers")?.sections
      .flatMap((section) => section.fields.map((field) => field.id));

    expect(ids).toContain("vascularRiskUnderstood");
    expect(ids).toContain("dissolvingUnderstood");
  });

  it("applies the revised shared client fields and anti-wrinkle workflow", () => {
    for (const template of consultationTemplates.filter((item) => item.sections.some((section) => section.fields.some((field) => field.id === "gpDetails")))) {
      const fields = template.sections.flatMap((section) => section.fields);
      expect(fields.find((field) => field.id === "emergencyContact")?.label).toBe("Emergency contact name");
      expect(fields.find((field) => field.id === "gpDetails")?.required).toBe(true);
    }
    const template = getConsultationTemplate("anti-wrinkle")!;
    const fields = template.sections.flatMap((section) => section.fields);
    expect(fields.find((field) => field.id === "objectivesConcerns")?.type).toBe("multi-checkbox");
    expect(fields.find((field) => field.id === "alternativesDiscussed")?.required).not.toBe(true);
    expect(fields.find((field) => field.id === "areasTreated")?.type).toBe("multi-checkbox");
    expect(fields.find((field) => field.id === "aftercareGiven")?.type).toBe("yes-no");
    expect(fields.some((field) => field.id === "labelUse")).toBe(false);
    expect(fields.filter((field) => ["tryingToConceive", "pregnant", "breastfeeding", "hrtContraception"].includes(field.id)).every((field) => field.hideWhen?.values.includes("Male"))).toBe(true);
  });

  it("hides female-specific questions for male clients across applicable forms", () => {
    const femaleSpecificIds = new Set([
      "tryingToConceive", "pregnant", "breastfeeding", "hrtContraception",
      "pregnantBreastfeeding", "pregnantTryingBreastfeeding", "pregnancyPotential",
      "oralContraception", "contraceptionPlan", "pregnantTrying", "polycysticOvaries",
      "menopause", "irregularPeriods", "birthControlPill",
    ]);
    const fields = consultationTemplates.flatMap((template) => template.sections.flatMap((section) => section.fields));
    for (const field of fields.filter((item) => femaleSpecificIds.has(item.id))) {
      expect(field.hideWhen?.values, field.id).toContain("Male");
    }
  });

  it("adds a Level 5-informed peel and microneedling consultation", () => {
    const template = getConsultationTemplate("skin-peel-microneedling");
    const ids = template?.sections.flatMap((section) => section.fields.map((field) => field.id));

    expect(template?.sourceFile).toBe("L5 Consultation Form.pdf");
    expect(ids).toEqual(expect.arrayContaining([
      "fitzpatrickType",
      "patchTestResult",
      "contraActions",
      "peelProduct",
      "needleDevice",
    ]));
  });

  it("adds a prescriber-led Mounjaro consultation and administration record", () => {
    const template = getConsultationTemplate("mounjaro");
    const ids = template?.sections.flatMap((section) => section.fields.map((field) => field.id));

    expect(template?.sourceFile).toBe("Mounjaro Consultation and Treatment Record.pdf");
    expect(ids).toEqual(expect.arrayContaining([
      "baselineBmi",
      "prescriberName",
      "plannedDose",
      "pancreatitisWarning",
      "contraceptionPlan",
      "doseGiven",
      "batchNumber",
      "administrationRouteSite",
      "nextDoseReview",
    ]));
    expect(template?.completionBlockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "pregnantTryingBreastfeeding" }),
      expect.objectContaining({ field: "acutePancreatitisSymptoms" }),
    ]));
  });
});
