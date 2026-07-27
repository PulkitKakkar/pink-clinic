import { describe, expect, it } from "vitest";
import {
  isStopMessage,
  normalizePhoneNumber,
} from "@/lib/notifications/marketing-opt-out-utils";

describe("promotional SMS opt-outs", () => {
  it("recognises standard SMS opt-out keywords", () => {
    expect(isStopMessage(" stop ")).toBe(true);
    expect(isStopMessage("anything", "STOP")).toBe(true);
    expect(isStopMessage("Please cancel my appointment")).toBe(false);
  });

  it("normalises common UK phone formats for customer matching", () => {
    expect(normalizePhoneNumber("07715 277 211")).toBe("+447715277211");
    expect(normalizePhoneNumber("+44 7715 277211")).toBe("+447715277211");
    expect(normalizePhoneNumber("0044 7715 277211")).toBe("+447715277211");
  });
});
