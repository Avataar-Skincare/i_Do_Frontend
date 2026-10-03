import Image from "next/image";
import { formatINR } from "@/lib/format";
import { orderStageLabel } from "@/lib/order-status";
import type { Order } from "@/lib/orders-storage";

export function OrderCard({ order, showTotal }: { order: Order; showTotal?: boolean }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <div className="font-mono font-semibold">{order.id}</div>
          <div className="text-[0.82rem] text-muted mt-0.5">
            {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {order.paymentMethod === "cod" ? "COD" : "Prepaid"}
          </div>
        </div>
        <span className="shrink-0 text-[0.72rem] font-semibold py-1 px-2.5 rounded-pill bg-gold-wash text-gold-deep whitespace-nowrap">
          {orderStageLabel(order)}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 mb-3.5">
        {order.items.map((item, i) => (
          <div key={`${item.id}-${item.finish}-${item.size}-${i}`} className="flex items-center gap-2.5 text-[0.88rem]">
            <div className="relative w-9 h-9 shrink-0 rounded-sm overflow-hidden border border-line bg-surface-2">
              <Image src={item.image} alt={item.name} fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-ink-2">
              {item.name}
              {item.size ? ` · US ${item.size}` : ""} · Qty {item.qty}
            </span>
          </div>
        ))}
      </div>
      {showTotal && (
        <div className="flex justify-between items-baseline pt-3 border-t border-line">
          <span className="text-[0.85rem] text-muted">Total</span>
          <span className="font-serif text-xl font-medium">{formatINR(order.total)}</span>
        </div>
      )}
    </div>
  );
}
