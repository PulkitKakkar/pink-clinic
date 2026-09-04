// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsultationForm } from "@/components/admin/consultation-form";
import { consultationTemplates, getConsultationTemplate, isPractitionerConsultationSection, validateConsultationAnswers, type ConsultationTemplate } from "@/lib/admin/templates";

const template: ConsultationTemplate = {
  slug: "touch-test",
  title: "Touch Test Consultation",
  description: "Interaction test fixture",
  sourceFile: "test.pdf",
  reviewRequired: true,
  version: "2026-08-29.1",
  sections: [
    {
      title: "Customer questions",
      audience: "client",
      fields: [
        {
          id: "medicalQuestion",
          label: "Do you have a relevant medical condition?",
          type: "yes-no",
          required: true,
        },
        {
          id: "treatmentAreas",
          label: "Treatment areas",
          type: "multi-checkbox",
          options: [
            { value: "Face", label: "Face" },
            { value: "Neck", label: "Neck" },
          ],
        },
      ],
    },
    {
      title: "Practitioner details",
      audience: "practitioner",
      fields: [],
    },
  ],
};

beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => ({
      beginPath: vi.fn(),
      closePath: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      scale: vi.fn(),
      stroke: vi.fn(),
    }),
  });
});

beforeEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderForm(initialAnswers: Record<string, string | boolean | string[]> = {}) {
  return render(
    <ConsultationForm
      template={template}
      practitionerNames={[]}
      treatmentNames={[]}
      initialAnswers={initialAnswers}
    />,
  );
}

describe("consultation form touch controls", () => {
  it("does not choose No when the question or radio-group background is tapped", async () => {
    const user = userEvent.setup();
    renderForm();
    const no = screen.getByRole<HTMLInputElement>("radio", { name: "No" });
    const yes = screen.getByRole<HTMLInputElement>("radio", { name: "Yes" });

    await user.click(screen.getByText("Do you have a relevant medical condition?"));
    expect(no.checked).toBe(false);
    expect(yes.checked).toBe(false);

    await user.click(screen.getByRole("radiogroup"));
    expect(no.checked).toBe(false);
    expect(yes.checked).toBe(false);
  });

  it("gives Yes and No independent full-option touch targets", async () => {
    const user = userEvent.setup();
    renderForm();
    const no = screen.getByRole<HTMLInputElement>("radio", { name: "No" });
    const yes = screen.getByRole<HTMLInputElement>("radio", { name: "Yes" });

    await user.click(screen.getByText("Yes"));
    expect(yes.checked).toBe(true);
    expect(no.checked).toBe(false);

    await user.click(screen.getByText("No"));
    expect(no.checked).toBe(true);
    expect(yes.checked).toBe(false);
  });

  it("enforces required Yes/No selection and restores saved answers", async () => {
    const { unmount } = renderForm();
    const no = screen.getByRole<HTMLInputElement>("radio", { name: "No" });
    const yes = screen.getByRole<HTMLInputElement>("radio", { name: "Yes" });
    expect(no.required).toBe(true);
    expect(yes.required).toBe(true);
    expect(no.validity.valueMissing).toBe(true);
    expect(yes.validity.valueMissing).toBe(true);
    unmount();

    renderForm({ medicalQuestion: "Yes" });
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Yes" }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "No" }).validity.valueMissing).toBe(false);
  });

  it("keeps multi-checkbox touch targets independent", async () => {
    const user = userEvent.setup();
    renderForm();
    const face = screen.getByRole<HTMLInputElement>("checkbox", { name: "Face" });
    const neck = screen.getByRole<HTMLInputElement>("checkbox", { name: "Neck" });

    await user.click(screen.getByText("Treatment areas"));
    expect(face.checked).toBe(false);
    expect(neck.checked).toBe(false);

    await user.click(screen.getByText("Neck"));
    expect(face.checked).toBe(false);
    expect(neck.checked).toBe(true);
  });

  it("saves the selected answer in a client-section draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ record: { id: "record-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderForm({ signatureData: "data:image/png;base64,test" });

    await user.click(screen.getByText("Yes"));
    await user.click(
      screen.getByRole("checkbox", {
        name: /consultation and treatment terms/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Validate and save client section",
      }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.answers.medicalQuestion).toBe("Yes");
    expect(payload.answers.recordStatus).toBe("draft");
    expect(payload.answers.clientSectionCompletedAt).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "Validate and save client section",
      }),
    ).toBeNull();
    expect(screen.getByText("Client section saved and locked")).toBeTruthy();
  });
});


describe("consultation client completion placement", () => {
  it("renders one completion and signature block after the final Skin Peel customer section", () => {
    const peelTemplate = getConsultationTemplate("skin-peel-microneedling")!;
    render(<ConsultationForm template={peelTemplate} practitionerNames={[]} treatmentNames={[]} />);

    expect(screen.getAllByText("Client section complete")).toHaveLength(1);
    const save = screen.getByRole("button", { name: "Validate and save client section" });
    expect(screen.getAllByLabelText("Customer signature pad")).toHaveLength(1);
    expect(screen.getAllByLabelText("Customer signature data")).toHaveLength(1);
    expect(screen.getAllByRole("checkbox", { name: /consultation and treatment terms/i })).toHaveLength(1);
    const declarations = screen.getByRole("heading", { name: "Pre-treatment declarations and consent" });
    const procedure = screen.getByRole("heading", { name: "Procedure record and aftercare" });
    expect(declarations.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(save.compareDocumentPosition(procedure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});


const reviewedTemplates = consultationTemplates.filter(
  (item) => !["laser-device", "anti-wrinkle"].includes(item.slug),
);

describe("completion controls across consultation forms (excluding Laser and Anti-Wrinkle)", () => {
  it.each(reviewedTemplates)("$title has one client completion block", (item) => {
    render(<ConsultationForm template={item} practitionerNames={[]} treatmentNames={[]} />);
    const save = screen.getByRole("button", { name: "Validate and save client section" });
    expect(screen.getAllByText("Client section complete")).toHaveLength(1);
    expect(screen.getAllByLabelText("Customer signature pad")).toHaveLength(1);
    expect(screen.getAllByLabelText("Customer signature data")).toHaveLength(1);
    expect(screen.getAllByRole("checkbox", { name: /consultation and treatment terms/i })).toHaveLength(1);
    expect(screen.getAllByRole("checkbox", { name: /I agree to receive promotional messages/i })).toHaveLength(1);
    const lastClient = item.sections.filter((section) => !isPractitionerConsultationSection(section)).at(-1)!;
    const heading = screen.getByRole("heading", { name: (name) => name === lastClient.title || name === `${lastClient.title} *` });
    expect(heading.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(reviewedTemplates)("$title has one locked completion block in a saved draft", (item) => {
    render(<ConsultationForm template={item} practitionerNames={[]} treatmentNames={[]} recordId="saved-draft"
      initialAnswers={{ recordStatus: "draft", clientSectionCompletedAt: "2026-09-04T08:00:00Z", signatureData: "data:image/png;base64,saved", termsAgreement: true }} />);
    expect(screen.getAllByText("Client section saved and locked")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Validate and save client section" })).toBeNull();
    const signature = screen.getByLabelText<HTMLInputElement>("Customer signature data");
    expect(signature.value).toBe("data:image/png;base64,saved");
    expect(signature.closest("[inert]")).not.toBeNull();
  });
});


describe("Skin Peel and Microneedling streamlined questions", () => {
  const item = getConsultationTemplate("skin-peel-microneedling")!;
  it("keeps optional goals and photography blank and assigns patch assessment to the practitioner", () => {
    render(<ConsultationForm template={item} practitionerNames={[]} treatmentNames={[]} />);
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: /Additional goals/ }).required).toBe(false);
    const photography = screen.getByRole("radiogroup", { name: /Optional consent to use agreed photographs/ });
    for (const radio of photography.querySelectorAll("input")) {
      expect(radio.required).toBe(false);
      expect(radio.checked).toBe(false);
    }
    const patchSection = item.sections.find((section) => section.fields.some((field) => field.id === "patchTestResult"))!;
    expect(isPractitionerConsultationSection(patchSection)).toBe(true);
    expect(patchSection.fields.map((field) => field.id)).toEqual(["patchTestDate", "patchTestProductArea", "patchTestResult", "patchTestReaction"]);
    const recent = item.sections.find((section) => section.title === "Recent procedures")!;
    expect(isPractitionerConsultationSection(recent)).toBe(false);
    expect(recent.fields).toHaveLength(6);
    const errors = validateConsultationAnswers(item, { recordStatus: "draft", clientSectionCompletedAt: "saved" });
    expect(errors.some((error) => /patch-test|Additional goals|Optional consent to use agreed photographs/i.test(error))).toBe(false);
  });

  it("switches procedure fields while preserving draft answers and saves unanswered photography as empty", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ record: { id: "draft-1" } }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ConsultationForm template={item} practitionerNames={[]} treatmentNames={[]} recordId="draft-1"
      initialAnswers={{ procedureType: "Medium-depth skin peel", peelProduct: "Saved peel", needleDevice: "Saved device", objectivesConcerns: "Saved concern" }} />);
    const procedure = screen.getByRole("combobox", { name: /^Procedure/ });
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Peel product, type and strength" }).value).toBe("Saved peel");
    expect(screen.queryByRole("textbox", { name: /Microneedling device/ })).toBeNull();
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: /Additional goals/ }).value).toBe("Saved concern");
    await user.selectOptions(procedure, "Microneedling");
    expect(screen.queryByRole("textbox", { name: "Peel product, type and strength" })).toBeNull();
    expect(screen.getByRole<HTMLTextAreaElement>("textbox", { name: /Microneedling device/ }).value).toBe("Saved device");
    await user.selectOptions(procedure, "Combined protocol");
    expect(screen.getByRole("textbox", { name: "Peel product, type and strength" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /Microneedling device/ })).toBeTruthy();
    await user.selectOptions(procedure, "Microneedling");
    const saveDraft = screen.getByRole("button", { name: "Save draft" });
    // jsdom does not honour the submit button's formNoValidate attribute.
    fireEvent.submit(saveDraft.closest("form")!, { submitter: saveDraft });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.answers.marketingPhotographyConsent).toBe("");
    expect(payload.answers.peelProduct).toBe("Saved peel");
    expect(payload.answers.needleDevice).toBe("Saved device");
  });
});
