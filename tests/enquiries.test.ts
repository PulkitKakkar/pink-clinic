import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/enquiries/route";

function enquiryRequest(branchId: string) {
  const form = new FormData();
  form.set("firstName", "Pulkit");
  form.set("lastName", "Kakkar");
  form.set("email", "pulkit@example.com");
  form.set("phone", "07123456789");
  form.set("branchId", branchId);
  form.set("interest", "A consultation");
  form.set("message", "Please call me back.");
  return new Request("https://pinkclinic.co.uk/api/enquiries", {
    method: "POST",
    body: form,
  });
}

function enquiryRequestWith(field: string, value: string) {
  const request = enquiryRequest("reading-west-street");
  return request.formData().then((form) => {
    form.set(field, value);
    return new Request(request.url, {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.20" },
      body: form,
    });
  });
}

describe("contact enquiries", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    ["reading-west-street", "info@pinkbeautysalons.co.uk"],
    ["reading-watlington-street", "info@pinkbeautysalons.co.uk"],
  ])("emails the selected branch for %s", async (branchId, recipient) => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("ENQUIRY_FROM_EMAIL", "Pink Beauty Website <info@pinkbeautysalons.co.uk>");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(enquiryRequest(branchId));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://pinkclinic.co.uk/contact?status=success");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual(
      expect.objectContaining({
        to: [recipient],
        reply_to: "pulkit@example.com",
        subject: "Website enquiry: A consultation",
      }),
    );
  });

  it("shows an error without an email provider or webhook", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("ENQUIRY_FROM_EMAIL", "");
    vi.stubEnv("ENQUIRY_WEBHOOK_URL", "");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(enquiryRequest("reading-west-street"));

    expect(response.headers.get("location")).toBe("https://pinkclinic.co.uk/contact?status=error");
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("rejects fields that exceed their server-side limit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(await enquiryRequestWith("firstName", "x".repeat(81)));

    expect(response.headers.get("location")).toBe(
      "https://pinkclinic.co.uk/contact?status=error",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects control characters", async () => {
    const response = await POST(
      await enquiryRequestWith("message", "Please call me\u0000back"),
    );

    expect(response.headers.get("location")).toBe(
      "https://pinkclinic.co.uk/contact?status=error",
    );
  });
});
