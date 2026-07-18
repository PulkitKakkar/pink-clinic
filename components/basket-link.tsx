"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useBasket } from "@/components/providers/basket-provider";

export function BasketLink({ mobile = false }: { mobile?: boolean }) {
  const { count } = useBasket();
  return <Link href="/basket" aria-label={`Basket with ${count} items`} className={mobile ? "mt-4 flex items-center justify-between rounded-xl bg-pink-light px-4 py-3 text-sm font-bold text-pink" : "relative grid h-11 w-11 place-items-center rounded-full border border-white/30 transition hover:bg-white hover:text-ink"}><span className={mobile ? "flex items-center gap-2" : ""}><ShoppingBag size={17} />{mobile && "Basket"}</span>{count > 0 && <span className={mobile ? "rounded-full bg-pink px-2 py-0.5 text-[10px] text-white" : "absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[9px] font-bold text-white"}>{count}</span>}</Link>;
}
