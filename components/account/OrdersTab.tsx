import type { Order } from "@/lib/orders-storage";
import { OrderCard } from "./OrderCard";
import { EmptyState } from "./EmptyState";

export function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="box"
        title="No orders yet"
        body="When you order, it'll show up here."
        ctaLabel="Shop the ring"
        ctaHref="/shop"
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your orders</h3>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} showTotal />
      ))}
    </div>
  );
}
