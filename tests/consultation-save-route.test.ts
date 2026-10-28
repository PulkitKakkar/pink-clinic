import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn(), update: vi.fn(), images: vi.fn(), history: vi.fn(), audit: vi.fn(), log: vi.fn() }));
vi.mock("@/lib/admin/storage", () => ({ getConsultation: mocks.get, saveConsultation: mocks.save, updateConsultationAnswers: mocks.update, updateConsultationImages: mocks.images, ConsultationStorageConfigurationError: class extends Error {}, ConsultationConflictError: class extends Error {} }));
vi.mock("@/lib/admin/booking-storage", () => ({ createBooking: mocks.history }));
vi.mock("@/lib/admin/activity-log", () => ({ logAdminActivity: mocks.audit, changedFields: () => ({}) }));
vi.mock("@/lib/observability", () => ({ logApplicationEvent: mocks.log }));
import { POST, PATCH } from "@/app/api/admin/consultations/route";
import { getConsultationTemplate } from "@/lib/admin/templates";
const id = "12345678-1234-1234-1234-123456789abc";
const draft = { id, templateSlug: "facial", templateTitle: "Facial", createdAt: "2026-10-21T10:00:00Z", answers: { recordStatus: "draft" }, images: [] };
const request = (body: unknown, method = "POST") => new Request("https://pinkclinic.co.uk/api/admin/consultations", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks(); mocks.get.mockResolvedValue(undefined);
  mocks.save.mockImplementation(async (record) => record);
  mocks.update.mockImplementation(async (_id, answers, options) => ({ ...draft, answers, images: options.images || [] }));
});
describe("draft autosave API protections", () => {
  it("saves incomplete drafts without consent, signature, history entries or repeated audit snapshots", async () => {
    const response = await POST(request({ templateSlug: "facial", creationId: id, autosave: true, answers: { firstName: "Synthetic", recordStatus: "draft" }, images: [] }));
    expect(response.status).toBe(200);
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ id, answers: { firstName: "Synthetic", recordStatus: "draft" } }), { idempotent: true });
    expect(mocks.history).not.toHaveBeenCalled(); expect(mocks.audit).not.toHaveBeenCalled();
  });
  it("reuses the same draft identifier when the previous response was lost", async () => {
    mocks.get.mockResolvedValue(draft);
    const response = await POST(request({ templateSlug: "facial", creationId: id, autosave: true, answers: { recordStatus: "draft" } }));
    expect(response.status).toBe(200);
    expect(mocks.save.mock.calls[0][0].id).toBe(id); expect(mocks.save.mock.calls[0][1].idempotent).toBe(true);
  });
  it("keeps final submission mandatory fields enforced", async () => {
    const response = await POST(request({ templateSlug: "facial", answers: { recordStatus: "ready-for-treatment" } }));
    expect(response.status).toBe(400); expect((await response.json()).validationErrors).toContain("Customer signature is required.");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects autosave attempts to finalise or lock an incomplete client section", async () => {
    for (const answers of [{ recordStatus: "ready-for-treatment" }, { recordStatus: "draft", clientSectionCompletedAt: "2026-10-21" }]) {
      expect((await POST(request({ templateSlug: "facial", creationId: id, autosave: true, answers }))).status).toBe(400);
    }
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("refuses to overwrite a record finalised by another tab", async () => {
    mocks.get.mockResolvedValue({ ...draft, answers: { recordStatus: "ready-for-treatment" } });
    const body = { id, templateSlug: "facial", creationId: id, autosave: true, answers: { recordStatus: "draft" } };
    expect((await POST(request(body))).status).toBe(409);
    expect((await PATCH(request(body, "PATCH"))).status).toBe(409);
    expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
  });
  it("writes answers and image metadata together with an atomic draft-only guard", async () => {
    mocks.get.mockResolvedValue(draft);
    const images = [{ id: "synthetic", key: "treatment-images/test", phase: "before", name: "test.png" }];
    const response = await PATCH(request({ id, autosave: true, answers: { recordStatus: "draft" }, images }, "PATCH"));
    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(id, { recordStatus: "draft" }, { images, draftOnly: true });
    expect(mocks.images).not.toHaveBeenCalled(); expect(mocks.history).not.toHaveBeenCalled();
  });
  it("reports a race conflict when finalisation occurs during an autosave", async () => {
    mocks.get.mockResolvedValue(draft); mocks.update.mockResolvedValue(undefined);
    expect((await PATCH(request({ id, autosave: true, answers: { recordStatus: "draft" } }, "PATCH"))).status).toBe(409);
  });
  it("preserves locked client answers before attempting a background update", async () => {
    mocks.get.mockResolvedValue({ ...draft, answers: { recordStatus: "draft", clientSectionCompletedAt: "locked", firstName: "Original" } });
    await PATCH(request({ id, autosave: true, answers: { recordStatus: "draft", firstName: "Changed", signatureData: "forged" } }, "PATCH"));
    // Incomplete legacy client sections still fail validation; no bypass is permitted.
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.log).toHaveBeenCalledWith("consultation_validation_failed", "WARN", expect.any(Object));
  });
  it("logs and returns a support reference without returning exception text", async () => {
    const error = new Error("Patient secret database password"); mocks.save.mockRejectedValue(error);
    const response = await POST(request({ templateSlug: "facial", autosave: true, answers: { recordStatus: "draft" } }));
    const body = await response.json(); expect(response.status).toBe(500);
    expect(body.requestId).toMatch(/^[a-f0-9-]{36}$/); expect(JSON.stringify(body)).not.toMatch(/Patient|password/);
    expect(mocks.log).toHaveBeenCalledWith("consultation_save_failed", "ERROR", expect.objectContaining({ operation: "autosave", requestId: body.requestId }));
  });
});


describe("consultation customer profile transfer", () => {
  it.each(["POST", "PATCH"])("copies DOB and occupation to customer history on %s finalisation", async (method) => {
    const template = getConsultationTemplate("facial")!;
    const answers: Record<string, string | boolean | string[]> = {};
    for (const field of template.sections.flatMap((section) => section.fields)) {
      if (field.required) answers[field.id] = field.type === "checkbox" ? true : "No";
    }
    Object.assign(answers, {
      recordStatus: "ready-for-treatment", firstName: "Synthetic", lastName: "Customer",
      contactNumber: "07700900000", email: "synthetic@example.com",
      dateOfBirth: "1990-06-15", occupation: "Teacher",
      signatureData: "synthetic-signature", termsAgreement: true,
    });
    if (method === "PATCH") mocks.get.mockResolvedValue(draft);
    const response = method === "POST"
      ? await POST(request({ templateSlug: "facial", answers }))
      : await PATCH(request({ id, answers }, "PATCH"));
    expect(await response.json()).not.toHaveProperty("validationErrors");
    expect(response.status).toBe(200);
    expect(mocks.history).toHaveBeenCalledWith(expect.objectContaining({
      customerFirstName: "Synthetic", customerLastName: "Customer",
      customerDateOfBirth: "1990-06-15", customerOccupation: "Teacher",
    }));
  });
});
