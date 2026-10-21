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
  customer: { name: string; email: string; phone: string; buyerGstin?: string | null; buyerLegalName?: string | null };
  address: { line: string; city: string; state: string; pin: string };
  status: string;
  /** Always set: orders require an account. */
  userId: string | null;
  /** Both null for COD — only ever set once a Razorpay payment is verified server-side. */
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
};

/**
 * Links the order to the logged-in account — the ido_at cookie goes along
 * automatically (lib/api.ts sends credentials on every call). For an online
 * payment, the three razorpay* fields are the actual proof of payment (see
 * lib/razorpay.ts) — the backend recomputes and checks the signature itself,
 * never trusting this call alone.
 */
export function saveOrder(
  input: Omit<Order, "id" | "date" | "status" | "userId" | "razorpayOrderId" | "razorpayPaymentId"> & {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }
): Promise<Order> {
  return apiPost<Order>("/orders", input);
}

export function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

/** Requires a logged-in user — call only when `useAuth().user` is set. */
export function getMyOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders/mine");
}
