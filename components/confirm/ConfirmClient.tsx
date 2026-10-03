"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { getOrder, type Order } from "@/lib/orders-storage";
import { orderStageLabel } from "@/lib/order-status";

export function ConfirmClient() {
  const orderId = useSearchParams().get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-16 text-muted">Loading…</div>;
  }

  if (!order) {
    return (
      <div className="max-w-[520px] mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gold-tint text-gold-deep grid place-items-center mx-auto mb-5">
          <Icon name="box" size={28} />
        </div>
        <h1 className="font-serif text-3xl font-medium mb-2.5">Nothing to confirm yet</h1>
        <p className="text-muted mb-6">Place an order to see your confirmation here.</p>
        <LinkButton href="/shop">Shop the ring</LinkButton>
      </div>
    );
  }

  const firstName = order.customer.name.split(" ")[0] || "there";

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="text-center mb-7">
        <div className="w-[84px] h-[84px] rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-5">
          <Icon name="check" size={38} />
        </div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-3">Order confirmed</div>
        <h1 className="font-serif font-medium text-[clamp(2.2rem,5vw,3.2rem)] mb-2.5">Welcome to i do 🤍</h1>
        <p className="text-muted max-w-[48ch] mx-auto">
          Thank you, {firstName}. Your order is in — here are the details.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-lg p-7">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="font-mono font-semibold">{order.id}</div>
            <div className="text-[0.82rem] text-muted mt-0.5">
              {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <span className="shrink-0 text-[0.72rem] font-semibold py-1 px-2.5 rounded-pill bg-gold-wash text-gold-deep whitespace-nowrap">
            {orderStageLabel(order)}
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {order.items.map((item, i) => {
            const isKit = item.id === "kit";
            const meta = isKit ? "Free sizing kit" : [item.finish, item.size && `US ${item.size}`].filter(Boolean).join(" · ");
            return (
              <div key={`${item.id}-${item.finish}-${item.size}-${i}`} className="flex items-center gap-3">
                <div className="relative w-11 h-11 shrink-0 rounded-sm overflow-hidden border border-line bg-surface-2">
                  <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.9rem] font-medium truncate">{item.name}</div>
                  <div className="text-[0.78rem] text-muted">{meta} · Qty {item.qty}</div>
                </div>
                <span className="font-serif font-medium shrink-0">
                  {item.price === 0 ? "Free" : formatINR(item.price * item.qty)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2 border-t border-line pt-3">
          <span>Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
          <span>Shipping</span>
          <span className="text-sage font-semibold">Free</span>
        </div>
        {order.codFee > 0 && (
          <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
            <span>COD handling</span>
            <span>{formatINR(order.codFee)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-line font-semibold">
          <span>
            Total {order.paymentMethod === "cod" && <span className="text-muted text-[0.8rem] font-normal">(pay on delivery)</span>}
          </span>
          <span className="font-serif text-[1.6rem] font-medium">{formatINR(order.total)}</span>
        </div>

        <p className="flex gap-2 items-center text-[0.85rem] text-muted mt-4 mb-0">
          <Icon name="truck" size={15} /> Estimated delivery in 3–7 working days to {order.address.city || "your address"}.
        </p>
      </div>

      <div className="flex gap-3.5 items-start bg-gold-tint border border-gold-wash rounded-lg p-5 mt-5">
        <span className="w-10.5 h-10.5 rounded-xl bg-surface shadow-sm text-gold-deep grid place-items-center shrink-0">
          <Icon name="face" size={19} />
        </span>
        <div>
          <h4 className="text-base font-semibold mb-1">Your 2 free consults are reserved</h4>
          <p className="text-[0.9rem] text-ink-2 m-0">
            Once your ring is delivered, book a dermatologist and a dietician session from your account — bring your scores and get a plan.
          </p>
        </div>
      </div>

      {!order.userId && (
        <div className="flex gap-3.5 items-start bg-surface border border-line rounded-lg p-5 mt-5">
          <span className="w-10.5 h-10.5 rounded-xl bg-gold-tint text-gold-deep grid place-items-center shrink-0">
            <Icon name="mail" size={19} />
          </span>
          <div>
            <h4 className="text-base font-semibold mb-1">Check your inbox</h4>
            <p className="text-[0.9rem] text-ink-2 m-0">
              We've emailed {order.customer.email} a link to create your account — that's how you'll track this
              order (and any future ones) going forward.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mt-6">
        <LinkButton variant="dark" href={order.userId ? "/account?tab=track" : "/account"}>
          {order.userId ? "Track order" : "Log in"}
        </LinkButton>
        <LinkButton variant="ghost" href="/consults">
          Consultations
        </LinkButton>
      </div>
    </div>
  );
}
