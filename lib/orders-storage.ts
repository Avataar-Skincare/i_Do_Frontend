import { apiGet, apiPost } from "@/lib/api";
import type { FinishId, PaymentMethod } from "@/lib/catalog";

/** The 9 order states (LLD §3.1). `pending_payment` orders are never listed in Account → Orders. */
export type OrderStatus =
  | "pending_payment"
  | "cod_pending"
  | "confirmed"
  | "kit_shipped"
  | "kit_delivered"
  | "size_submitted"
  | "ring_shipped"
  | "ring_delivered"
  | "cancelled";

export type Shipment = {
  id: string;
  kind: string;
  status: string;
  courier: string | null;
  awb: string | null;
  trackingUrl: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

/** The customer's view of an order (owner only). Every money field is integer paise. */
export type Order = {
  id: string;
  status: OrderStatus;
  cancelReason: "unpaid" | "cod_unconfirmed" | "customer" | "kit_rto" | "ring_refused" | "admin" | null;
  paymentMethod: PaymentMethod;
  finish: FinishId;
  /** Null until the size is submitted; locked after. */
  usSize: number | null;
  unitPrice: number;
  listPrice: number;
  subtotal: number;
  codFee: number;
  discount: number;
  total: number;
  amountPaid: number;
  kitPriceSnapshot: number;
  customer: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pin: string };
  buyerGstin?: string | null;
  buyerLegalName?: string | null;
  sizeDueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  shipments: Shipment[];
};

/** Passed to the Razorpay Checkout widget; created server-side with payment_capture=1. */
export type RazorpayCheckout = { id: string; amount: number; currency: string; keyId: string };

export type CreateOrderInput = {
  finish: FinishId;
  paymentMethod: PaymentMethod;
  customer: { name: string; email: string; phone: string };
  address: { line: string; city: string; state: string; pin: string };
  buyerGstin?: string;
  buyerLegalName?: string;
};

export type PaymentProof = { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string };

/**
 * POST /orders. The server prices the order itself — no amounts are sent. The same
 * Idempotency-Key returns the same order, so reuse the key when retrying after
 * "Payment not completed. Try again", and use a fresh one for a new attempt.
 */
export function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string
): Promise<{ order: Order; razorpay?: RazorpayCheckout }> {
  return apiPost("/orders", input, { headers: { "Idempotency-Key": idempotencyKey } });
}

/** Sends the Razorpay Checkout result for server-side signature verification. */
export function verifyPayment(orderId: string, proof: PaymentProof): Promise<Order> {
  return apiPost<Order>(`/orders/${orderId}/payment/verify`, proof);
}

/** Owner only. Also returns pending_payment orders, so /confirm can poll while a payment settles. */
export function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

/** Requires a logged-in user — call only when `useAuth().user` is set. Never includes pending_payment orders. */
export function getMyOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders/mine");
}
