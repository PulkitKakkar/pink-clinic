import type { PricingProvider, TreatmentPrice } from "./types";

const treatmentPrices: TreatmentPrice[] = [
  { serviceId: "hydrafacial", branchId: "reading-west-street", price: 99 },
  { serviceId: "hydrafacial", branchId: "reading-watlington-street", price: 120 },
  { serviceId: "laser-hair-removal", branchId: "reading-west-street", price: 25, label: "From" },
  { serviceId: "laser-hair-removal", branchId: "reading-watlington-street", price: 30, label: "From" },
  { serviceId: "skin-rejuvenation", branchId: "reading-west-street", price: 100, label: "From" },
  { serviceId: "skin-rejuvenation", branchId: "reading-watlington-street", price: 120, label: "From" },
  { serviceId: "anti-wrinkle-treatments", branchId: "reading-west-street", price: null, label: "Consultation required" },
  { serviceId: "anti-wrinkle-treatments", branchId: "reading-watlington-street", price: null, label: "Consultation required" },
];

class StaticPricingProvider implements PricingProvider {
  getTreatmentPrice(serviceId: string, branchId: string) {
    return treatmentPrices.find((price) => price.serviceId === serviceId && price.branchId === branchId);
  }

  getBranchPrices(branchId: string) {
    return treatmentPrices.filter((price) => price.branchId === branchId);
  }
}

export function formatTreatmentPrice(price: TreatmentPrice | undefined) {
  if (!price) return "Price on consultation";
  if (price.price === null) return price.label ?? "Consultation required";
  return `${price.label ? `${price.label} ` : ""}£${price.price}`;
}

// Replace with a Sanity, commerce, or booking-platform adapter without changing UI code.
export const pricingProvider: PricingProvider = new StaticPricingProvider();
