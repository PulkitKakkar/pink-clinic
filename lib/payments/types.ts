export type CheckoutItemInput = { handle: string; variantName: string; quantity: number };
export type PaymentItem = CheckoutItemInput & {
  title: string;
  kind: "service" | "product" | "course";
  unitAmount: number;
  serviceId: string;
  requiresShipping: boolean;
  durationMinutes: number;
};
export type PaymentCustomer = {
  firstName: string; lastName: string; email: string; phone: string; address: string; postcode: string;
};
export type PaymentOrder = {
  sessionId: string;
  source: "basket" | "catalog" | "treatment";
  branchId: string;
  branchSlug: string;
  items: PaymentItem[];
  amountTotal: number;
  shippingAmount: number;
  status: "pending" | "paid";
  customer: PaymentCustomer | null;
  shippingAddress: string;
  createdAt: string;
  startsAt?: string;
};

export function paymentAppointments(order: PaymentOrder) {
  return order.items.flatMap((item, itemIndex) => item.kind === "service"
    ? Array.from({ length: item.quantity }, (_, index) => ({
        key: `${order.sessionId}:${itemIndex}:${index}`,
        serviceId: item.serviceId,
        treatmentName: `${item.title}${item.variantName ? ` · ${item.variantName}` : ""}`,
        durationMinutes: item.durationMinutes,
      }))
    : []);
}
