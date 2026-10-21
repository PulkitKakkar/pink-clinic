import type { PaymentItem } from "./types";

type BnplMethod = "klarna" | "afterpay_clearpay";
export type BnplApproval = {
  method: BnplMethod;
  branchId: string;
  handle: string;
  kind: PaymentItem["kind"];
  evidence: string;
};

// Add entries only after recording provider coverage for the legal seller,
// exact offering and fulfilment timing in docs/BNPL_LAUNCH_REVIEW_2026-10-21.md.
// Dashboard "Enabled" alone does not establish this coverage.
const approvedOfferings: readonly BnplApproval[] = [];

export function checkoutPaymentMethods(
  branchId: string,
  items: readonly PaymentItem[],
  approvals: readonly BnplApproval[] = approvedOfferings,
): Array<"card" | BnplMethod> {
  // card includes enabled Apple Pay / Google Pay on eligible hosted Checkout devices.
  const methods: Array<"card" | BnplMethod> = ["card"];
  if (!items.length || items.some((item) => /gift[\s_-]*(card|voucher)/i.test(`${item.handle} ${item.title}`))) return methods;
  for (const method of ["klarna", "afterpay_clearpay"] as const) {
    if (items.every((item) => approvals.some((approval) =>
      approval.method === method && approval.branchId === branchId &&
      approval.handle === item.handle && approval.kind === item.kind && approval.evidence.trim(),
    ))) methods.push(method);
  }
  return methods;
}
