import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "@/lib/security/rate-limit";

describe("request rate limiting", () => {
  it("rejects requests beyond the configured window limit", async () => {
    const options = {
      scope: `test-${crypto.randomUUID()}`,
      identifier: "198.51.100.10",
      limit: 2,
      windowSeconds: 60,
    };

    expect(await consumeRateLimit(options)).toBe(true);
    expect(await consumeRateLimit(options)).toBe(true);
    expect(await consumeRateLimit(options)).toBe(false);
  });
});
