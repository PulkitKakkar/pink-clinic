"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useBasket } from "@/components/providers/basket-provider";

export function BasketLink({ mobile = false, mobileHeader = false, onNavigate }: { mobile?: boolean; mobileHeader?: boolean; onNavigate?: () => void }) {
  const { count } = useBasket();
  const itemLabel = count === 1 ? "item" : "items";
  if (mobileHeader) {
    return <Link href="/basket" onClick={onNavigate} aria-label={`Basket with ${count} ${itemLabel}`} className="relative grid h-[42px] w-[42px] place-items-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-ink"><ShoppingBag size={18} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[9px] font-bold text-white shadow">{count}</span>}</Link>;
  }
  return <Link href="/basket" onClick={onNavigate} aria-label={`Basket with ${count} ${itemLabel}`} className={mobile ? "mt-4 flex items-center justify-between rounded-xl bg-pink-light px-4 py-3 text-sm font-bold text-pink" : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-bold text-ink transition hover:-translate-y-0.5 hover:text-pink"}><span className="flex items-center gap-2"><ShoppingBag size={17} />Basket</span>{count > 0 && <span className={mobile ? "rounded-full bg-pink px-2 py-0.5 text-[10px] text-white" : "grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1.5 text-[9px] font-bold text-white"}>{count}</span>}</Link>;
}
