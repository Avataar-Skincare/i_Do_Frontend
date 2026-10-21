import Image from "next/image";
import { formatINR } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";
import { FINISHES } from "@/lib/content/product";
import { GALLERY } from "@/lib/content/shop";
import type { Order } from "@/lib/orders-storage";
import { SizeSubmit } from "./SizeSubmit";

export function OrderCard({
  order,
  showTotal,
  onOrderChange,
}: {
  order: Order;
  showTotal?: boolean;
  /** Called with the fresh order after something changes it (e.g. the size is submitted). */
  onOrderChange?: (order: Order) => void;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <div className="font-mono font-semibold">{order.id}</div>
          <div className="text-[0.82rem] text-muted mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {order.paymentMethod === "cod" ? "COD" : "Prepaid"}
          </div>
        </div>
        <span className="shrink-0 text-[0.72rem] font-semibold py-1 px-2.5 rounded-pill bg-gold-wash text-gold-deep whitespace-nowrap">
          {orderStatusLabel(order)}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 mb-3.5">
        <div className="flex items-center gap-2.5 text-[0.88rem]">
          <div className="relative w-9 h-9 shrink-0 rounded-sm overflow-hidden border border-line bg-surface-2">
            <Image src={GALLERY[0].src} alt="i do ring" fill sizes="36px" className="object-cover" />
          </div>
          <span className="text-ink-2">
            i do ring · {FINISHES.find((f) => f.id === order.finish)?.name ?? order.finish} ·{" "}
            {order.usSize ? `US ${order.usSize}` : "size to be submitted"}
          </span>
        </div>
      </div>
      {showTotal && (
        <div className="flex justify-between items-baseline pt-3 border-t border-line">
          <span className="text-[0.85rem] text-muted">Total</span>
          <span className="font-serif text-xl font-medium">{formatINR(order.total)}</span>
        </div>
      )}
      {order.status === "size_submitted" && order.usSize && (
        <p className="text-[0.88rem] text-ink-2 mt-3.5 mb-0">
          Size US {order.usSize} is locked. Your ring ships next.
        </p>
      )}
      {order.status === "kit_delivered" && onOrderChange && <SizeSubmit order={order} onSubmitted={onOrderChange} />}
    </div>
  );
}
