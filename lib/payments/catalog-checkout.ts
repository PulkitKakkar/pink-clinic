import type { CatalogItem } from "@/lib/catalog";
import type { CheckoutItemInput, PaymentItem } from "@/lib/payments/types";

export function requiresProductDelivery(kind: string | undefined, handle: string) {
  return kind === "product" && !/gift-(card|voucher)/i.test(handle);
}

export class CheckoutValidationError extends Error {}

export function resolveCheckoutItems(input: CheckoutItemInput[], catalog: CatalogItem[]): PaymentItem[] {
  if (!Array.isArray(input) || !input.length || input.length > 50)
    throw new CheckoutValidationError("Choose between 1 and 50 items.");
  let quantityTotal = 0;
  const items = input.map((entry) => {
    if (!entry || typeof entry.handle !== "string" || typeof entry.variantName !== "string" || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 20)
      throw new CheckoutValidationError("Invalid item or quantity.");
    const item = catalog.find((item) => item.handle === entry.handle);
    const variant = item?.variants.find((variant) => variant.name === entry.variantName);
    if (!item || !variant || variant.available === false || item.merchantAvailability === "out_of_stock" || !Number.isFinite(variant.price) || variant.price <= 0)
      throw new CheckoutValidationError("An item is unavailable. Please update your basket.");
    const durationMinutes = Number(item.duration?.match(/\d+/)?.[0]) || 60;
    if (item.kind === "service" && (durationMinutes < 5 || durationMinutes > 480))
      throw new CheckoutValidationError("This treatment requires booking with the clinic.");
    quantityTotal += entry.quantity;
    return { handle: item.handle, variantName: variant.name, quantity: entry.quantity, title: item.title, kind: item.kind, unitAmount: Math.round(variant.price * 100), serviceId: `catalog:${item.handle}`, requiresShipping: requiresProductDelivery(item.kind, item.handle), durationMinutes };
  });
  if (quantityTotal > 50) throw new CheckoutValidationError("Please limit your order to 50 items.");
  return items;
}

export function checkoutTotals(items: PaymentItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const productSubtotal = items.filter((item) => item.requiresShipping).reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const shippingAmount = productSubtotal > 0 && productSubtotal < 7500 ? 499 : 0;
  return { subtotal, shippingAmount, amountTotal: subtotal + shippingAmount };
}
