export type PaymentProvider = "lopay" | "sumup";

export type BranchPaymentConfig = {
  provider: PaymentProvider;
  providerName: string;
  businessName: string;
  checkoutDescription: string;
};

const branchPaymentConfig: Record<string, BranchPaymentConfig> = {
  "reading-west-street": {
    provider: "lopay",
    providerName: "Lopay",
    businessName: "Pink Beauty · West Street",
    checkoutDescription: "Secure payment powered by Lopay",
  },
  "reading-watlington-street": {
    provider: "sumup",
    providerName: "SumUp",
    businessName: "Pink Beauty · Watlington Street",
    checkoutDescription: "Secure payment powered by SumUp",
  },
};

export function getBranchPaymentConfig(branchId: string) {
  return branchPaymentConfig[branchId];
}
