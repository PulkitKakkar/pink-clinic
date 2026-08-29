import { describe, expect, it } from "vitest";
import { MARKETING_SMS_FOOTER, prepareMarketingSms, validateMarketingSms } from "@/lib/notifications/marketing-sms-utils";

describe("promotional SMS preparation", () => {
  it("adds the clinic identity and opt-out footer", () => {
    expect(prepareMarketingSms("  Summer offer  ")).toBe(`Summer offer\n\n${MARKETING_SMS_FOOTER}`);
  });

  it("rejects empty and oversized messages", () => {
    expect(validateMarketingSms(" ")).toBeTruthy();
    expect(validateMarketingSms("x".repeat(500))).toBeTruthy();
    expect(validateMarketingSms("A valid offer")).toBeNull();
  });
});
