"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { FINISHES } from "@/lib/content/product";

export type CartItem = {
  id: string;
  name: string;
  finish: string;
  /** The API id (gold, silver, black); optional only for carts saved before this field existed. */
  finishId?: string;
  size: string;
  price: number; // paise
  qty: number;
  image: string;
};

type CartContextValue = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, finish: string, size: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ido_cart";

// One ring per order (LLD §1). The sizing kit is included with the ring, so a
// stored standalone "kit" line from an older cart is dropped and any ring line is
// forced to qty 1 with the current size wording.
function parseCart(raw: string): CartItem[] {
  try {
    const stored: CartItem[] = raw ? JSON.parse(raw) : [];
    const ring = stored.find((i) => i.id === "ring");
    if (!ring) return [];
    const finishId = ring.finishId ?? FINISHES.find((f) => f.name === ring.finish)?.id ?? "gold";
    return [{ ...ring, finishId, qty: 1, size: "Sizing kit included" }];
  } catch {
    return [];
  }
}

// The cart lives in localStorage; useSyncExternalStore keeps React in step with it
// (and with other tabs) without a setState-in-effect hydration step.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerSnapshot(): string {
  return "";
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: the cart simply won't persist */
  }
  listeners.forEach((l) => l());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const cart = useMemo(() => parseCart(raw), [raw]);

  // The bag holds at most one ring: adding again replaces it (e.g. to change finish).
  function addItem(item: CartItem) {
    writeCart([{ ...item, qty: 1 }]);
  }

  function removeItem(id: string, finish: string, size: string) {
    writeCart(cart.filter((i) => !(i.id === id && i.finish === finish && i.size === size)));
  }

  function clearCart() {
    writeCart([]);
  }

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, cartCount, cartSubtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
