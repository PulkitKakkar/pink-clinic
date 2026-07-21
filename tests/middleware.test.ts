import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("admin and Studio access control", () => {
  it("rejects an unauthenticated admin API request", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/api/admin/bookings"),
    );
    expect(response.status).toBe(401);
  });

  it("redirects an unauthenticated admin page to login", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/admin/customers"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?next=%2Fadmin%2Fcustomers",
    );
  });

  it("allows a valid admin session and rejects it for Studio", () => {
    const adminRequest = new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: "pink-admin-session=pink-local-admin-test-session" },
    });
    expect(proxy(adminRequest).headers.get("x-middleware-next")).toBe("1");

    const studioRequest = new NextRequest("http://localhost:3000/studio", {
      headers: { cookie: "pink-admin-session=pink-local-admin-test-session" },
    });
    expect(proxy(studioRequest).headers.get("location")).toBe(
      "http://localhost:3000/studio-login",
    );
  });
});
