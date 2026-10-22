import { describe, expect, it } from "vitest";
import { checkoutPaymentMethods, type BnplApproval } from "@/lib/payments/payment-methods";
import type { PaymentItem } from "@/lib/payments/types";
const item: PaymentItem = { handle: "facial", title: "Facial", kind: "service", variantName: "Standard", quantity: 1, unitAmount: 5000, serviceId: "facial", requiresShipping: false, durationMinutes: 60 };
const approval: BnplApproval = { method: "klarna", branchId: "west", handle: "facial", kind: "service", evidence: "Provider case: example" };
describe("BNPL coverage guard", () => {
  it("defaults both branches to card until coverage is recorded", () => {
    for (const branch of ["reading-west-street", "reading-watlington-street"]) expect(checkoutPaymentMethods(branch, [item])).toEqual(["card"]);
  });
  it("requires independent coverage of every item for each provider", () => {
    expect(checkoutPaymentMethods("west", [item], [approval])).toEqual(["card", "klarna"]);
    expect(checkoutPaymentMethods("west", [item], [approval, { ...approval, method: "afterpay_clearpay" }])).toEqual(["card", "klarna", "afterpay_clearpay"]);
    expect(checkoutPaymentMethods("west", [item, { ...item, handle: "course" }], [approval])).toEqual(["card"]);
  });
  it("does not reuse approval across sellers or item kinds or without evidence", () => {
    expect(checkoutPaymentMethods("clinic", [item], [approval])).toEqual(["card"]);
    expect(checkoutPaymentMethods("west", [{ ...item, kind: "course" }], [approval])).toEqual(["card"]);
    expect(checkoutPaymentMethods("west", [item], [{ ...approval, evidence: " " }])).toEqual(["card"]);
  });
  it.each(["Gift card", "Gift voucher", "gift-card", "gift_voucher"])("excludes %s even when allowlisted", (title) => {
    expect(checkoutPaymentMethods("west", [{ ...item, title }], [approval])).toEqual(["card"]);
  });
});
