"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BasketItem } from "@/lib/basket/types";

const STORAGE_KEY = "pink-beauty-basket";

type BasketContextValue = {
  items: BasketItem[];
  count: number;
  total: number;
  addItem: (item: Omit<BasketItem, "id" | "quantity">) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearBasket: () => void;
};

const BasketContext = createContext<BasketContextValue | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as BasketItem[];
      window.requestAnimationFrame(() => setItems(Array.isArray(parsed) ? parsed : []));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const save = useCallback((next: BasketItem[]) => {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback((item: Omit<BasketItem, "id" | "quantity">) => {
    if (items.length && items[0].branchId !== item.branchId) {
      const replace = window.confirm("Your basket contains items from another branch. Clear it and start a new basket for this branch?");
      if (!replace) return false;
    }
    const base = items.length && items[0].branchId !== item.branchId ? [] : items;
    const id = `${item.branchId}:${item.handle}:${item.variantName}`;
    const existing = base.find((entry) => entry.id === id);
    save(existing ? base.map((entry) => entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...base, { ...item, id, quantity: 1 }]);
    return true;
  }, [items, save]);

  const updateQuantity = useCallback((id: string, quantity: number) => save(quantity < 1 ? items.filter((item) => item.id !== id) : items.map((item) => item.id === id ? { ...item, quantity } : item)), [items, save]);
  const removeItem = useCallback((id: string) => save(items.filter((item) => item.id !== id)), [items, save]);
  const clearBasket = useCallback(() => save([]), [save]);
  const value = useMemo(() => ({ items, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), addItem, updateQuantity, removeItem, clearBasket }), [addItem, clearBasket, items, removeItem, updateQuantity]);

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("useBasket must be used within BasketProvider");
  return context;
}
