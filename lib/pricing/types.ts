export type TreatmentPrice = {
  serviceId: string;
  branchId: string;
  price: number | null;
  label?: string;
};

export interface PricingProvider {
  getTreatmentPrice(serviceId: string, branchId: string): TreatmentPrice | undefined;
  getBranchPrices(branchId: string): TreatmentPrice[];
}
