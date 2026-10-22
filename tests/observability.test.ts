import { afterEach, describe, expect, it, vi } from "vitest";
import { logApplicationEvent } from "@/lib/observability";
import { observeApi } from "@/lib/observe-api";
import { onRequestError } from "@/instrumentation";

afterEach(() => vi.restoreAllMocks());
describe("privacy-preserving application error logs", () => {
  it("omits error messages, stacks, secret values and patient details", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("Patient Alice: secret database password=private"), { code: "23505", name: "PostgresError", detail: "private patient record" });
    logApplicationEvent("consultation_save_failed", "ERROR", { operation: "autosave", requestId: "12345678-1234-1234-1234-123456789abc", error });
    const line = log.mock.calls[0][0];
    expect(JSON.parse(line)).toMatchObject({ event: "consultation_save_failed", severity: "ERROR", databaseCode: "23505", errorType: "PostgresError" });
    expect(line).not.toMatch(/Alice|password|private|stack|detail/);
  });
  it("records handled API 5xx responses without inspecting body, URL or headers", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = observeApi("/api/admin/images/view", async () => Response.json({ error: "private internal diagnostic" }, { status: 500 }));
    const response = await handler();
    expect(response.status).toBe(500);
    expect(response.headers.get("x-pink-request-id")).toMatch(/^[a-f0-9-]{36}$/);
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ route: "/api/admin/images/view", event: "api_error_response", status: 500 });
    expect(log.mock.calls[0][0]).not.toContain("private");
  });
  it("logs unhandled framework errors using the route template only", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    onRequestError(new Error("patient secret"), { path: "/admin/customers?email=private@example.com", method: "GET", headers: { cookie: "private" } }, { routerKind: "App Router", routePath: "/admin/consultation-records/[id]", routeType: "render", revalidateReason: undefined });
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ event: "server_error", route: "/admin/consultation-records/[id]" });
    expect(log.mock.calls[0][0]).not.toMatch(/patient|secret|example|cookie/);
  });
  it("does not log successful API responses", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await observeApi("/api/health", () => new Response("ok"))()).status).toBe(200);
    expect(log).not.toHaveBeenCalled();
  });
});
