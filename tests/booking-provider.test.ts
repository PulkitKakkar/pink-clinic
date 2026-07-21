import { describe, expect, it } from "vitest";
import { bookingProvider } from "@/lib/booking";

describe("booking provider", () => {
  it("routes priced treatments to branch checkout", () => {
    expect(
      bookingProvider.getBookingUrl({
        branchId: "reading-west-street",
        branchSlug: "reading-west-st",
        serviceSlug: "hydrafacial",
      }),
    ).toBe("/checkout/reading-west-st/hydrafacial");
  });

  it("preserves enquiry context for non-priced requests", () => {
    expect(
      bookingProvider.getBookingUrl({ branchId: "reading-west-street" }),
    ).toBe("/contact?branchId=reading-west-street");
  });
});
