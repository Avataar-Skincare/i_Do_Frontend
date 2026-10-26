import { Icon } from "@/components/ui/Icon";
import { formatIstDate } from "@/lib/format";
import {
  CANCEL_REASON_TEXT,
  ORDER_STAGES,
  courierName,
  latestShipment,
  orderStageIndex,
  refundLine,
  returningText,
  ringReturning,
  stageDate,
} from "@/lib/order-status";
import type { Order, Shipment } from "@/lib/orders-storage";

/** "Track with Delhivery · AWB 123": a link when the courier gave one, plain text for a hand-entered AWB. */
function ShipmentLink({ shipment }: { shipment: Shipment | undefined }) {
  if (!shipment || (!shipment.awb && !shipment.trackingUrl)) return null;
  const label = [courierName(shipment.courier) ? `Track with ${courierName(shipment.courier)}` : "Track", shipment.awb ? `AWB ${shipment.awb}` : null]
    .filter(Boolean)
    .join(" · ");
  return shipment.trackingUrl ? (
    <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-[0.82rem] font-semibold text-gold-deep underline">
      {label}
    </a>
  ) : (
    <span className="inline-block py-2 text-[0.82rem] text-ink-2">{label}</span>
  );
}

/** What the customer can still do after the ring arrives, with the real dates from the order. */
function AfterDelivery({ order }: { order: Order }) {
  if (!order.damageWindowUntil && !order.warrantyUntil) return null;
  return (
    <ul className="m-0 mt-1.5 p-0 list-none text-[0.82rem] text-ink-2 flex flex-col gap-1">
      {order.damageWindowUntil && (
        <li>Damaged or the wrong item? Report it by {formatIstDate(order.damageWindowUntil)}, with a box-opening video and photos.</li>
      )}
      {order.warrantyUntil && <li>Warranty until {formatIstDate(order.warrantyUntil)}.</li>}
    </ul>
  );
}

export function TrackTimeline({ order }: { order: Order }) {
  const idx = orderStageIndex(order);

  if (order.status === "cancelled") {
    return (
      <div className="text-[0.95rem] text-ink-2">
        <p className="font-semibold text-ink mb-1">
          This order was cancelled{order.cancelledAt ? ` on ${formatIstDate(order.cancelledAt)}` : ""}.
        </p>
        {order.cancelReason && <p className="mb-1">{CANCEL_REASON_TEXT[order.cancelReason]}</p>}
        {refundLine(order.refund) && <p className="mb-0">{refundLine(order.refund)}</p>}
      </div>
    );
  }

  const returning = ringReturning(order);

  return (
    <div>
      {ORDER_STAGES.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        const isLast = i === ORDER_STAGES.length - 1;
        const reached = done || active;
        const shipment =
          reached && stage.status === "kit_shipped"
            ? latestShipment(order, "kit")
            : reached && stage.status === "ring_shipped"
              ? latestShipment(order, "ring")
              : undefined;
        const when = reached ? stageDate(order, stage.status) : null;
        const title = returning && stage.status === "ring_shipped" ? "Your ring is on its way back to us" : stage.title;
        const body = returning && stage.status === "ring_shipped" ? returningText(order) : stage.body;

        return (
          <div key={stage.title} className={`relative flex gap-4 ${isLast ? "" : "pb-6"}`}>
            {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-line-2" />}
            <div
              className={[
                "relative z-10 w-7 h-7 shrink-0 rounded-full border-2 grid place-items-center",
                done ? "bg-sage border-sage text-white" : "",
                active ? "bg-gold border-gold text-white shadow-[0_0_0_4px_var(--color-gold-wash)]" : "",
                !done && !active ? "bg-surface border-line-2 text-transparent" : "",
              ].join(" ")}
            >
              {(done || active) && <Icon name="check" size={15} />}
            </div>
            <div>
              <h4 className={`text-[0.98rem] mb-0.5 font-medium ${done || active ? "text-ink" : "text-muted"}`}>
                {title}
                {when && <span className="ml-2 font-mono text-[0.72rem] font-normal text-muted">{formatIstDate(when)}</span>}
              </h4>
              <p className="text-[0.82rem] text-muted">{body}</p>
              <ShipmentLink shipment={shipment} />
              {stage.status === "ring_delivered" && active && <AfterDelivery order={order} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
