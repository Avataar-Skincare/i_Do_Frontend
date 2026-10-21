import type { Order, OrderStatus, Refund, Shipment } from "@/lib/orders-storage";

/** What the customer sees for each of the 9 order states (LLD §3.1 / contract README §4). */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Confirming payment",
  cod_pending: "Awaiting confirmation",
  confirmed: "Order confirmed",
  kit_shipped: "Sizing kit shipped",
  kit_delivered: "Sizing kit delivered",
  size_submitted: "Size submitted",
  ring_shipped: "Ring shipped",
  ring_delivered: "Ring delivered",
  cancelled: "Cancelled",
};

/** The newest shipment of a kind (a ring can have a second delivery attempt). */
export function latestShipment(order: Pick<Order, "shipments">, kind: Shipment["kind"]): Shipment | undefined {
  const of = order.shipments.filter((s) => s.kind === kind);
  return of.sort((a, b) => (a.attempt ?? 1) - (b.attempt ?? 1)).at(-1);
}

/** "Your ring is on its way back to us": the order stays ring_shipped while the ring shipment is rto. */
export function ringReturning(order: Pick<Order, "status" | "shipments">): boolean {
  return order.status === "ring_shipped" && latestShipment(order, "ring")?.status === "rto";
}

export function orderStatusLabel(order: Pick<Order, "status" | "shipments">): string {
  return ringReturning(order) ? "Ring returning" : ORDER_STATUS_LABEL[order.status];
}

/** Why an order was cancelled, in the customer's words. */
export const CANCEL_REASON_TEXT: Record<NonNullable<Order["cancelReason"]>, string> = {
  unpaid: "The payment wasn't completed in time.",
  cod_unconfirmed: "We couldn't confirm this Cash on Delivery order with you.",
  customer: "You cancelled this order.",
  kit_rto: "Your sizing kit came back to us undelivered.",
  ring_refused: "Your ring was refused at delivery and is back with us.",
  admin: "Our team cancelled this order.",
};

/** One line about the refund, or null if there isn't one. The amount is the server's, never worked out here. */
export function refundLine(refund: Refund | null): string | null {
  if (!refund) return null;
  const amount = "₹" + Math.round(refund.amount / 100).toLocaleString("en-IN");
  if (refund.status === "paid") return `Refund of ${amount} paid.`;
  if (refund.status === "rejected") return `Your refund of ${amount} couldn't be processed. Please contact support.`;
  if (refund.status === "processing") return `Refund of ${amount} is on its way.`;
  return `Refund of ${amount} requested.`;
}

/** What a returning ring means for money, so the customer isn't left guessing. */
export function returningText(order: Pick<Order, "paymentMethod">): string {
  const fee = order.paymentMethod === "cod" ? " and the ₹100 COD handling fee" : "";
  return `Once it reaches us we refund what you paid minus the sizing kit's price${fee}, and ask where to send it.`;
}

/** The journey shown on the tracking tab, in order. */
export const ORDER_STAGES: ReadonlyArray<{ status: OrderStatus; title: string; body: string }> = [
  { status: "confirmed", title: "Order confirmed", body: "We've received your order. Your sizing kit ships first." },
  { status: "kit_shipped", title: "Sizing kit shipped", body: "On its way to you. Delivery takes 4–7 working days." },
  { status: "kit_delivered", title: "Sizing kit delivered", body: "Try the sizers, then submit your size from your account." },
  { status: "size_submitted", title: "Size submitted", body: "Your size is locked and we're getting your ring ready." },
  { status: "ring_shipped", title: "Ring shipped", body: "On its way to you with our delivery partner." },
  { status: "ring_delivered", title: "Ring delivered", body: "Enjoy your ring. Your 2 free consults are now unlocked." },
];

/** Position in ORDER_STAGES. Orders still waiting on payment or COD confirmation sit on the first stage. */
export function orderStageIndex(order: Pick<Order, "status">): number {
  const i = ORDER_STAGES.findIndex((s) => s.status === order.status);
  return i === -1 ? 0 : i;
}
