import { describe, expect, it } from "vitest";
import {
  isValidTwilioSignature,
  twilioSignature,
} from "@/lib/security/twilio-signature";

describe("Twilio webhook signatures", () => {
  const url = "https://pinkclinic.co.uk/api/notifications/sms/incoming";
  const values: [string, string][] = [
    ["From", "+447700900123"],
    ["Body", "STOP"],
  ];

  it("accepts a matching signature", () => {
    const signature = twilioSignature(url, values, "auth-token");
    expect(isValidTwilioSignature(signature, signature)).toBe(true);
  });

  it("rejects absent and altered signatures", () => {
    const signature = twilioSignature(url, values, "auth-token");
    expect(isValidTwilioSignature(null, signature)).toBe(false);
    expect(isValidTwilioSignature("invalid", signature)).toBe(false);
  });
});
