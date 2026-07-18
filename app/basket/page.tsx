import type { Metadata } from "next";
import { BasketPage } from "@/components/basket/basket-page";

export const metadata: Metadata = { title: "Your basket", robots: { index: false, follow: false } };

export default function BasketRoute() {
  return <BasketPage />;
}
