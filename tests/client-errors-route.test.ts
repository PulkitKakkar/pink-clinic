import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ log: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/observability", () => ({ logApplicationEvent: mocks.log }));
vi.mock("@/lib/security/rate-limit", () => ({ consumeRateLimit: mocks.limit, requestIdentifier: () => "test" }));
import { POST } from "@/app/api/admin/client-errors/route";
const request = (body: unknown) => new Request("http://localhost/api/admin/client-errors", { method: "POST", body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.limit.mockResolvedValue(true); });
describe("admin client error reporting", () => {
  it("logs only allowlisted category codes and discards any attached clinical details", async () => {
    expect((await POST(request({ code: "network", answers: { patient: "private" }, stack: "private" }))).status).toBe(204);
    expect(mocks.log).toHaveBeenCalledWith("client_error", "ERROR", { clientCode: "network" });
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain("private");
  });
  it("rejects arbitrary messages and oversized reports", async () => {
    expect((await POST(request({ code: "patient private diagnosis" }))).status).toBe(400);
    expect((await POST(request({ code: "network", value: "x".repeat(2000) }))).status).toBe(413);
    expect(mocks.log).not.toHaveBeenCalled();
  });
  it("rate limits a noisy browser", async () => {
    mocks.limit.mockResolvedValue(false);
    expect((await POST(request({ code: "render" }))).status).toBe(429);
    expect(mocks.log).not.toHaveBeenCalled();
  });
});
