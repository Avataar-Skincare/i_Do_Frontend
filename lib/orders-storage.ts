import type { CartItem } from "@/lib/cart-context";
import { apiGet, apiPost } from "@/lib/api";

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  codFee: number;
  total: number;
  paymentMethod: "online" | "cod";
  customer: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pin: string };
  status: string;
};

export function saveOrder(input: Omit<Order, "id" | "date" | "status">): Promise<Order> {
  return apiPost<Order>("/orders", input);
}

export function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}
