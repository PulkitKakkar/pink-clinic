import { describe, expect, it, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("admin, Academy and Studio access control", async () => {
  it("rejects an unauthenticated admin API request", async () => {
    const response = (await proxy(
      new NextRequest("http://localhost:3000/api/admin/bookings"),
    ));
    expect(response.status).toBe(401);
  });

  it("redirects an unauthenticated admin page to login", async () => {
    const response = (await proxy(
      new NextRequest("http://localhost:3000/admin/customers"),
    ));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?next=%2Fadmin%2Fcustomers",
    );
  });

  it("keeps production redirects on the active Amplify host", async () => {
    const response = (await proxy(
      new NextRequest("https://main.d269wokvvip0dc.amplifyapp.com/admin", {
        headers: {
          "x-forwarded-host": "main.d269wokvvip0dc.amplifyapp.com",
          "x-forwarded-proto": "https",
        },
      }),
    ));
    expect(response.headers.get("location")).toBe(
      "https://main.d269wokvvip0dc.amplifyapp.com/admin/login?next=%2Fadmin",
    );
  });

  it("allows a valid admin session and rejects it for Studio", async () => {
    const adminRequest = new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: "pink-admin-session=pink-local-admin-test-session" },
    });
    expect((await proxy(adminRequest)).headers.get("x-middleware-next")).toBe("1");

    const studioRequest = new NextRequest("http://localhost:3000/studio", {
      headers: { cookie: "pink-admin-session=pink-local-admin-test-session" },
    });
    expect((await proxy(studioRequest)).headers.get("location")).toBe(
      "http://localhost:3000/studio-login",
    );
  });

  it("keeps Academy administration separate from salon staff", async () => {
    const staffRequest = new NextRequest(
      "http://localhost:3000/academy-admin",
      { headers: { cookie: "pink-admin-session=pink-local-admin-test-session" } },
    );
    expect((await proxy(staffRequest)).headers.get("location")).toBe(
      "http://localhost:3000/academy-admin/login?next=%2Facademy-admin",
    );

    const academyRequest = new NextRequest(
      "http://localhost:3000/academy-admin",
      {
        headers: {
          cookie:
            "pink-academy-admin-session=pink-local-academy-admin-session",
        },
      },
    );
    expect((await proxy(academyRequest)).headers.get("x-middleware-next")).toBe("1");
    expect(
      (await proxy(
        new NextRequest("http://localhost:3000/admin", {
          headers: {
            cookie:
              "pink-academy-admin-session=pink-local-academy-admin-session",
          },
        }),
      )).headers.get("location"),
    ).toBe("http://localhost:3000/admin/login?next=%2Fadmin");
  });

  it("retires the learner routes from the salon admin", async () => {
    expect(
      (await proxy(new NextRequest("http://localhost:3000/admin/learners"))).headers.get(
        "location",
      ),
    ).toBe("http://localhost:3000/academy-admin");
    expect(
      (await proxy(new NextRequest("http://localhost:3000/api/admin/learners"))).status,
    ).toBe(404);
  });
});


describe("temporary account redirect", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("preserves staff bookmarks and query parameters on the old host", async () => {
    vi.stubEnv("LEGACY_REDIRECT_HOST", "main.d269wokvvip0dc.amplifyapp.com");
    vi.stubEnv("LEGACY_REDIRECT_ORIGIN", "https://main.dex0d2j1ekar0.amplifyapp.com");
    const response = await proxy(new NextRequest("https://main.d269wokvvip0dc.amplifyapp.com/admin/bookings?date=2026-10-08"));
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://main.dex0d2j1ekar0.amplifyapp.com/admin/bookings?date=2026-10-08");
    expect((await proxy(new NextRequest("https://main.dex0d2j1ekar0.amplifyapp.com/"))).headers.get("x-middleware-next")).toBe("1");
  });
  it("keeps payment callbacks and POST requests on their original deployment", async () => {
    vi.stubEnv("LEGACY_REDIRECT_HOST", "main.d269wokvvip0dc.amplifyapp.com");
    vi.stubEnv("LEGACY_REDIRECT_ORIGIN", "https://main.dex0d2j1ekar0.amplifyapp.com");
    for (const request of [new NextRequest("https://main.d269wokvvip0dc.amplifyapp.com/api/stripe/webhook", { method: "POST" }), new NextRequest("https://main.d269wokvvip0dc.amplifyapp.com/contact", { method: "POST" })]) {
      expect((await proxy(request)).headers.get("x-middleware-next")).toBe("1");
    }
  });
});
