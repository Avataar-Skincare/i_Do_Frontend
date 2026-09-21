"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  finish: string;
  size: string;
  price: number; // paise
  qty: number;
  image: string;
};

type CartContextValue = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, finish: string, size: string) => void;
  updateQty: (id: string, finish: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ido_cart";

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  function addItem(item: CartItem) {
    setCart((prev) => {
      const match = prev.find((i) => i.id === item.id && i.finish === item.finish && i.size === item.size);
      if (match) {
        return prev.map((i) => (i === match ? { ...i, qty: i.qty + item.qty } : i));
      }
      return [...prev, item];
    });
  }

  function removeItem(id: string, finish: string, size: string) {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.finish === finish && i.size === size)));
  }

  function updateQty(id: string, finish: string, size: string, qty: number) {
    setCart((prev) =>
      prev.map((i) => (i.id === id && i.finish === finish && i.size === size ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, cartCount, cartSubtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
