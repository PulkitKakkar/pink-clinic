export type BasketItem = {
  id: string;
  branchId: string;
  branchSlug: string;
  handle: string;
  title: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  image: string;
  kind?: "service" | "product" | "course";
  duration?: string;
};
