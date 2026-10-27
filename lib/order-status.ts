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

/** When the customer's order reached a stage, from the API's own timestamps; null if unknown or not yet. */
export function stageDate(order: Order, status: OrderStatus): string | null {
  const kit = latestShipment(order, "kit");
  const ring = latestShipment(order, "ring");
  switch (status) {
    case "confirmed":
      return order.createdAt ?? null;
    case "kit_shipped":
      return kit?.shippedAt ?? null;
    case "kit_delivered":
      return order.kitDeliveredAt ?? kit?.deliveredAt ?? null;
    case "size_submitted":
      return order.sizeSubmittedAt ?? null;
    case "ring_shipped":
      return ring?.shippedAt ?? null;
    case "ring_delivered":
      return order.ringDeliveredAt ?? ring?.deliveredAt ?? null;
    default:
      return null;
  }
}

/** Couriers arrive as lower-case ids ("delhivery"); show them as names. */
export function courierName(courier: string | null | undefined): string | null {
  return courier ? courier.charAt(0).toUpperCase() + courier.slice(1) : null;
}

/** The seven steps on an order card (LLD wireframe "account submit size"): one more than the tracking timeline, which starts at "confirmed". */
export const CARD_STAGES: ReadonlyArray<{ status: OrderStatus[]; label: string }> = [
  { status: ["pending_payment", "cod_pending"], label: "Placed" },
  { status: ["confirmed"], label: "Confirmed" },
  { status: ["kit_shipped"], label: "Kit shipped" },
  { status: ["kit_delivered"], label: "Kit delivered" },
  { status: ["size_submitted"], label: "Size submitted" },
  { status: ["ring_shipped"], label: "Ring shipped" },
  { status: ["ring_delivered"], label: "Ring delivered" },
];

/** Which of the seven steps the order is on; -1 for a cancelled order, which has no journey to show. */
export function cardStageIndex(order: Pick<Order, "status">): number {
  return CARD_STAGES.findIndex((s) => s.status.includes(order.status));
}

/** The shipment worth a footer line, newest kind first: a replacement ring (after a claim), else the ring, else the kit. */
export function footerShipment(order: Pick<Order, "shipments">): Shipment | undefined {
  return latestShipment(order, "replacement") ?? latestShipment(order, "ring") ?? latestShipment(order, "kit");
}
