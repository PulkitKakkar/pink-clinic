// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsultationForm } from "@/components/admin/consultation-form";
import type { ConsultationTemplate } from "@/lib/admin/templates";

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
