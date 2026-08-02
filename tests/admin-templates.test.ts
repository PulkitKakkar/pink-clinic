import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { consultationTemplates, getConsultationTemplate } from "@/lib/admin/templates";

describe("consultation templates", () => {
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
});
