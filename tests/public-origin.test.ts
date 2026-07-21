import { describe, expect, it, vi } from "vitest";
import { getPublicOrigin } from "@/lib/public-origin";

describe("public request origin", () => {
  it("does not replace the active host with the configured canonical domain", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pinkclinic.co.uk");
    const request = new Request("https://main.d269wokvvip0dc.amplifyapp.com/api/admin/login", {
      headers: {
        "x-forwarded-host": "main.d269wokvvip0dc.amplifyapp.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(getPublicOrigin(request)).toBe(
      "https://main.d269wokvvip0dc.amplifyapp.com",
    );
    vi.unstubAllEnvs();
  });
});
