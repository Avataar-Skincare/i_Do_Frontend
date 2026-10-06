"use client";

import { useState } from "react";
import type { Order } from "@/lib/orders-storage";
import { TrackTimeline } from "./TrackTimeline";
import { EmptyState } from "./EmptyState";

export function TrackTab({ orders }: { orders: Order[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="truck"
        title="Nothing to track"
        body="Order your ring to follow it here."
        ctaLabel="Shop the ring"
        ctaHref="/shop"
      />
    );
  }

  const order = orders.find((o) => o.id === selectedId) ?? orders[0];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Tracking {order.id}</h3>
      <TrackTimeline order={order} />

      {orders.length > 1 && (
        <div className="mt-8 pt-6 border-t border-line">
          <div className="text-[0.82rem] text-muted mb-2.5">Your recent orders</div>
          <div className="flex flex-wrap gap-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={[
                  "font-mono text-[0.78rem] font-medium py-1.5 px-3 rounded-pill border transition-colors",
                  o.id === order.id
                    ? "bg-nav text-white border-nav"
                    : "border-line-2 text-ink-2 hover:border-gold",
                ].join(" ")}
              >
                {o.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
