import type { Order } from "@/lib/orders-storage";

/**
 * Ported from the prototype's ORDER_STAGES/orderStageIndex: there's no real
 * fulfillment backend yet, so status is simulated client-side from days
 * elapsed since the order was placed, same as the original demo.
 */
export const ORDER_STAGES = [
  { title: "Order confirmed", body: "We've received your order and it's being prepared." },
  { title: "Packed", body: "Your ring is boxed and ready for dispatch." },
  { title: "Shipped", body: "On its way to you with our delivery partner." },
  { title: "Out for delivery", body: "Arriving today — keep your phone handy." },
  { title: "Delivered", body: "Enjoy your ring. Your free consults are now unlocked." },
] as const;

export function orderStageIndex(order: Pick<Order, "date">): number {
  const days = Math.floor((Date.now() - new Date(order.date).getTime()) / 86400000);
  if (days <= 0) return 0;
  if (days === 1) return 1;
  if (days === 2) return 2;
  if (days === 3) return 3;
  return 4;
}

export function orderStageLabel(order: Pick<Order, "date">): string {
  return ORDER_STAGES[orderStageIndex(order)].title;
}
