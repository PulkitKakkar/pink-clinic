import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("admin, Academy and Studio access control", () => {
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

  it("keeps production redirects on the active Amplify host", () => {
    const response = proxy(
      new NextRequest("https://main.d269wokvvip0dc.amplifyapp.com/admin", {
        headers: {
          "x-forwarded-host": "main.d269wokvvip0dc.amplifyapp.com",
          "x-forwarded-proto": "https",
        },
      }),
    );
    expect(response.headers.get("location")).toBe(
      "https://main.d269wokvvip0dc.amplifyapp.com/admin/login?next=%2Fadmin",
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

  it("keeps Academy administration separate from salon staff", () => {
    const staffRequest = new NextRequest(
      "http://localhost:3000/academy-admin",
      { headers: { cookie: "pink-admin-session=pink-local-admin-test-session" } },
    );
    expect(proxy(staffRequest).headers.get("location")).toBe(
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
    expect(proxy(academyRequest).headers.get("x-middleware-next")).toBe("1");
    expect(
      proxy(
        new NextRequest("http://localhost:3000/admin", {
          headers: {
            cookie:
              "pink-academy-admin-session=pink-local-academy-admin-session",
          },
        }),
      ).headers.get("location"),
    ).toBe("http://localhost:3000/admin/login?next=%2Fadmin");
  });

  it("retires the learner routes from the salon admin", () => {
    expect(
      proxy(new NextRequest("http://localhost:3000/admin/learners")).headers.get(
        "location",
      ),
    ).toBe("http://localhost:3000/academy-admin");
    expect(
      proxy(new NextRequest("http://localhost:3000/api/admin/learners")).status,
    ).toBe(404);
  });
});
