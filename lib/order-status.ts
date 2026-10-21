import type { Order, OrderStatus } from "@/lib/orders-storage";

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

export function orderStatusLabel(order: Pick<Order, "status">): string {
  return ORDER_STATUS_LABEL[order.status];
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
