import Image from "next/image";
import Link from "next/link";
import { formatINR, formatIstDate } from "@/lib/format";
import {
  CANCEL_REASON_TEXT,
  CARD_STAGES,
  cardStageIndex,
  courierName,
  footerShipment,
  orderStatusLabel,
  refundLine,
  returningText,
  ringReturning,
} from "@/lib/order-status";
import { FINISHES } from "@/lib/content/product";
import { GALLERY } from "@/lib/content/shop";
import { canRequestCancel, type Order, type Shipment } from "@/lib/orders-storage";
import { CancelOrder } from "./CancelOrder";
import { SizeSubmit } from "./SizeSubmit";

/** "Kit · delivered 24 Oct · Track with Shiprocket · AWB SR1": where the newest parcel is, with its tracking link. */
function ShipmentFooter({ shipment }: { shipment: Shipment }) {
  const what = shipment.kind === "ring" ? "Ring" : shipment.kind === "kit" ? "Kit" : "Replacement";
  const state =
    shipment.status === "delivered" && shipment.deliveredAt
      ? `delivered ${formatIstDate(shipment.deliveredAt)}`
      : shipment.status === "shipped" && shipment.shippedAt
        ? `shipped ${formatIstDate(shipment.shippedAt)}`
        : shipment.status === "rto"
          ? "on its way back"
          : shipment.status === "lost"
            ? "lost in transit"
            : shipment.status;
  const track = shipment.awb || shipment.trackingUrl ? [courierName(shipment.courier) ? `Track with ${courierName(shipment.courier)}` : "Track", shipment.awb ? `AWB ${shipment.awb}` : null].filter(Boolean).join(" · ") : null;
  return (
    <div className="mt-4 pt-3.5 border-t border-line text-[0.82rem] text-ink-2">
      {what} · {state}
      {track &&
        (shipment.trackingUrl ? (
          <>
            {" · "}
            <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-deep underline">
              {track}
            </a>
          </>
        ) : (
          <> · {track}</>
        ))}
    </div>
  );
}

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
      {order.status !== "cancelled" && (
        <ol aria-label="Order progress" className="hidden sm:grid grid-cols-7 gap-1.5 m-0 mb-4 p-0 list-none text-center text-[0.72rem]">
          {CARD_STAGES.map((stage, i) => {
            const at = cardStageIndex(order);
            return (
              <li
                key={stage.label}
                aria-current={i === at ? "step" : undefined}
                className={[
                  "py-2 px-1 rounded-[13px]",
                  i < at ? "bg-sage-bg text-ink-2" : "",
                  i === at ? "bg-gold text-ink font-semibold" : "",
                  i > at ? "bg-bg-2 border border-line text-muted" : "",
                ].join(" ")}
              >
                {stage.label}
              </li>
            );
          })}
        </ol>
      )}
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
      {ringReturning(order) && (
        <div className="bg-bg-2 border border-line rounded-lg p-3.5 mb-3.5">
          <div className="font-semibold">Your ring is on its way back to us</div>
          <p className="text-[0.85rem] text-ink-2 mt-1 mb-0">{returningText(order)}</p>
        </div>
      )}
      {order.status === "cancelled" && (
        <div className="bg-bg-2 border border-line rounded-lg p-3.5 mb-3.5">
          <div className="font-semibold">Cancelled</div>
          {order.cancelReason && <p className="text-[0.85rem] text-ink-2 mt-1 mb-0">{CANCEL_REASON_TEXT[order.cancelReason]}</p>}
          {refundLine(order.refund) && <p className="text-[0.85rem] text-ink-2 mt-1 mb-0">{refundLine(order.refund)}</p>}
        </div>
      )}
      {order.status === "size_submitted" && order.usSize && (
        <p className="text-[0.88rem] text-ink-2 mt-3.5 mb-0">
          Size US {order.usSize} is locked. Your ring ships next. Think it&apos;s wrong?{" "}
          <Link href="/support" className="font-semibold text-gold-deep underline">
            Contact support
          </Link>{" "}
          before it ships.
        </p>
      )}
      {order.status === "kit_delivered" && onOrderChange && <SizeSubmit order={order} onSubmitted={onOrderChange} />}
      {onOrderChange && canRequestCancel(order) && <CancelOrder order={order} onOrderChange={onOrderChange} />}
      {order.status !== "cancelled" && order.status !== "pending_payment" && footerShipment(order) && (
        <ShipmentFooter shipment={footerShipment(order)!} />
      )}
    </div>
  );
}
