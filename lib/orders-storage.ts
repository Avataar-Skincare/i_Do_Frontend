import { apiGet, apiPost, apiPut } from "@/lib/api";
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
  kind: "kit" | "ring" | "replacement";
  /** pending → shipped → delivered, or rto (returning to us; see rtoReason) or lost. */
  status: "pending" | "shipped" | "delivered" | "rto" | "lost";
  attempt?: number;
  courier: string | null;
  awb: string | null;
  trackingUrl: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

export type Refund = {
  id: string;
  /** amount = amountPaid − kitDeduction − feeDeduction, fixed when the refund is created. */
  amountPaid: number;
  kitDeduction: number;
  feeDeduction: number;
  amount: number;
  method: "razorpay" | "bank" | "upi" | null;
  /** True while a bank or UPI refund still waits for the customer's details. */
  destinationRequired: boolean;
  status: "requested" | "processing" | "paid" | "rejected";
  paidAt?: string | null;
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
  offerCode?: string | null;
  buyerGstin?: string | null;
  buyerLegalName?: string | null;
  kitDeliveredAt?: string | null;
  /** 23:59:59 IST of kit delivery + 15 days. A reminder target, not a cut-off. */
  sizeDueAt?: string | null;
  sizeSubmittedAt?: string | null;
  ringDeliveredAt?: string | null;
  /** Damaged / wrong-item claims are accepted until this time (7 days after the first ring delivery). */
  damageWindowUntil?: string | null;
  warrantyUntil?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  shipments: Shipment[];
  refund: Refund | null;
  claim?: Claim | null;
  invoice?: InvoiceSummary | null;
  creditNotes?: CreditNoteSummary[];
  /** The 30-day consult window, set at the first ring delivery. Null before that. */
  consultWindow?: ConsultWindow | null;
};

export type InvoiceSummary = { id: string; number: string; type: "b2c" | "b2b"; issuedAt: string; total: number; ready: boolean };
export type CreditNoteSummary = { id: string; number: string; issuedAt: string; total: number; ready: boolean };
export type Claim = { id: string; kind: string; status: string; description: string; decisionNote?: string | null };
export type EntitlementState = "available" | "booked" | "used" | "expired";
export type ConsultWindow = { startsAt: string; expiresAt: string; derm: EntitlementState; dietician: EntitlementState };

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

/**
 * Submits the ring size once; it locks. Only while the order is `kit_delivered` (a size is still
 * accepted after `sizeDueAt`). The caller must show "You're choosing US N. This can't be changed
 * later. Confirm?" first, which is what `confirmed: true` attests. 409 SIZE_LOCKED or
 * INVALID_TRANSITION if it is already locked or the kit hasn't been delivered.
 */
export function submitSize(orderId: string, usSize: number): Promise<Order> {
  return apiPost<Order>(`/orders/${orderId}/size`, { usSize, confirmed: true });
}

/* ── Cancel & refunds ────────────────────────────────────────────────────── */

/**
 * Where a COD refund is paid. The server encrypts these at rest and purges them 90 days
 * after the refund is paid; only the last 4 characters ever come back (`Refund.destLast4`).
 * Setting one needs a fresh step-up OTP.
 */
export type RefundDestination =
  | { type: "upi"; upiId: string }
  | { type: "bank"; accountNo: string; ifsc: string; holder: string };

/**
 * How the money comes back, decided by the server:
 * - `razorpay` — prepaid, straight back to the original payment.
 * - `bank_or_upi` — COD after the kit was delivered; the customer must give UPI/bank details
 *   behind a step-up OTP.
 * - `none` — nothing has been paid yet (e.g. COD before the kit is delivered).
 * - `rto_first` — the kit is still in transit, so the cancel is only an RTO request and what
 *   is refunded depends on whether the kit comes back.
 */
export type RefundRoute = "razorpay" | "bank_or_upi" | "none" | "rto_first";

/** What a cancel would refund, worked out by the server. Never recompute these in the browser. */
export type CancelPreview = {
  cancellable: boolean;
  refundPaise: number;
  /** Deducted once the sizing kit has been delivered — the customer keeps the kit. */
  kitPricePaise: number;
  /** The ₹100 COD handling fee, which is never refunded. 0 on prepaid orders. */
  codFeePaise: number;
  refundRoute: RefundRoute;
};

/** `rto_requested` means the kit is in transit: the order stays kit_shipped until it is back. */
export type CancelOutcome = "cancelled" | "rto_requested";

/** Statuses in which the customer may cancel at all (the contract allows these four). */
const CANCELLABLE: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "confirmed",
  "kit_shipped",
  "kit_delivered",
  "size_submitted",
]);

/**
 * Whether to offer a Cancel button. The server decides for real (`cancellable` on the preview,
 * and 409 NOT_CANCELLABLE on the cancel itself) — this only avoids showing the button on an
 * order that plainly cannot be cancelled, such as one whose ring has already shipped.
 */
export function canRequestCancel(order: Order): boolean {
  return CANCELLABLE.has(order.status);
}

/** GET /orders/{id}/cancel-preview — what cancelling now would refund, and by which route. */
export function getCancelPreview(orderId: string): Promise<CancelPreview> {
  return apiGet<CancelPreview>(`/orders/${orderId}/cancel-preview`);
}

/**
 * POST /orders/{id}/cancel. `destination` is required when the preview's route is `bank_or_upi`
 * and only works behind a fresh step-up OTP (401 STEP_UP_REQUIRED otherwise). 409 NOT_CANCELLABLE
 * if the ring has shipped meanwhile or the order is already cancelled; 400 UPI_INVALID /
 * IFSC_INVALID on bad details. The credit note is issued by the server.
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
  destination?: RefundDestination,
): Promise<{ outcome: CancelOutcome; order: Order }> {
  const res = await apiPost<{ outcome: CancelOutcome; order: unknown }>(
    `/orders/${orderId}/cancel`,
    destination ? { reason, destination } : { reason },
  );
  return { outcome: res.outcome, order: assertOrder(res.order, `order ${orderId}`) };
}

/**
 * PUT /orders/{id}/refund-destination — add or change UPI/bank details on a refund that is still
 * `requested` (e.g. the COD refund created once a refused ring is back with us). Needs step-up.
 */
export function setRefundDestination(orderId: string, destination: RefundDestination): Promise<Refund> {
  return apiPut<Refund>(`/orders/${orderId}/refund-destination`, destination);
}

const ORDER_STATUSES: ReadonlySet<string> = new Set<OrderStatus>([
  "pending_payment",
  "cod_pending",
  "confirmed",
  "kit_shipped",
  "kit_delivered",
  "size_submitted",
  "ring_shipped",
  "ring_delivered",
  "cancelled",
]);

/** The API answered, but not with an order the way the contract describes one. */
export class UnexpectedResponseError extends Error {
  constructor(what: string) {
    super(`The server's answer for ${what} wasn't in the expected format.`);
  }
}

/**
 * Fails loudly, with a readable error, if the server returns something that isn't a contract-shaped
 * order (for example an older backend returning raw rows without `shipments`), instead of letting a
 * screen crash on `undefined.filter`. Extra fields are fine; only what the screens rely on is checked.
 */
export function assertOrder(value: unknown, what = "this order"): Order {
  const o = value as Partial<Order> | null;
  if (
    !o ||
    typeof o !== "object" ||
    typeof o.id !== "string" ||
    typeof o.status !== "string" ||
    !ORDER_STATUSES.has(o.status) ||
    !Array.isArray(o.shipments) ||
    typeof o.customer !== "object" ||
    o.customer === null ||
    typeof o.createdAt !== "string"
  ) {
    throw new UnexpectedResponseError(what);
  }
  return o as Order;
}

/** Owner only. Also returns pending_payment orders, so /confirm can poll while a payment settles. */
export async function getOrder(id: string): Promise<Order> {
  return assertOrder(await apiGet<unknown>(`/orders/${id}`), `order ${id}`);
}

/** Requires a logged-in user — call only when `useAuth().user` is set. Never includes pending_payment orders. */
export async function getMyOrders(): Promise<Order[]> {
  const rows = await apiGet<unknown>("/orders/mine");
  if (!Array.isArray(rows)) throw new UnexpectedResponseError("your orders");
  return rows.map((row) => assertOrder(row, "your orders"));
}
