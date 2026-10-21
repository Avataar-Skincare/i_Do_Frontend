"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { getOrder, type Order } from "@/lib/orders-storage";
import { orderStatusLabel } from "@/lib/order-status";
import { FINISHES } from "@/lib/content/product";
import { GALLERY, PRODUCT } from "@/lib/content/shop";

// A UPI payment can stay "authorized" for a while: keep checking for about 12 minutes.
const POLL_EVERY_MS = 4000;
const POLL_FOR_MS = 12 * 60 * 1000;

export function ConfirmClient() {
  const orderId = useSearchParams().get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    async function load() {
      try {
        const next = await getOrder(orderId!);
        if (!live) return;
        setOrder(next);
        if (next.status === "pending_payment") {
          if (Date.now() - startedAt < POLL_FOR_MS) timer = setTimeout(load, POLL_EVERY_MS);
          else setGaveUp(true);
        }
      } catch {
        // Owner-only: someone else's order, or a signed-out visitor, reads as "nothing to confirm".
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();

    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
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
  const finishName = FINISHES.find((f) => f.id === order.finish)?.name ?? order.finish;
  const pending = order.status === "pending_payment";
  const cancelled = order.status === "cancelled";

  const eyebrow = pending
    ? "Confirming your payment…"
    : cancelled
      ? "Order cancelled"
      : order.status === "cod_pending"
        ? "Order placed"
        : "Order confirmed";
  const heading = pending ? "Hold on a moment" : cancelled ? "This order was cancelled" : "Welcome to i do 🤍";
  const intro = pending
    ? gaveUp
      ? "We haven't received the confirmation from your bank yet. If money was deducted it will be matched to this order automatically. Check Account → Orders in a little while."
      : "We're confirming your payment. This can take a few minutes for UPI, so please keep this page open."
    : cancelled
      ? "No payment is pending for this order."
      : order.status === "cod_pending"
        ? `Thank you, ${firstName}. We'll confirm your Cash on Delivery order with you by phone or WhatsApp. Your sizing kit ships once it's confirmed.`
        : `Thank you, ${firstName}. Your order is in. Your sizing kit ships first, and your ring follows once you submit your size.`;

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="text-center mb-7">
        <div className="w-[84px] h-[84px] rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-5">
          <Icon name={pending || cancelled ? "info" : "check"} size={38} />
        </div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-3">{eyebrow}</div>
        <h1 className="font-serif font-medium text-[clamp(2.2rem,5vw,3.2rem)] mb-2.5">{heading}</h1>
        <p className="text-muted max-w-[48ch] mx-auto" role={pending ? "status" : undefined}>
          {intro}
        </p>
      </div>

      <div className="bg-surface border border-line rounded-lg p-7">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="font-mono font-semibold">{order.id}</div>
            <div className="text-[0.82rem] text-muted mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <span className="shrink-0 text-[0.72rem] font-semibold py-1 px-2.5 rounded-pill bg-gold-wash text-gold-deep whitespace-nowrap">
            {orderStatusLabel(order)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-11 h-11 shrink-0 rounded-sm overflow-hidden border border-line bg-surface-2">
            <Image src={GALLERY[0].src} alt={PRODUCT.name} fill sizes="44px" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.9rem] font-medium truncate">{PRODUCT.name}</div>
            <div className="text-[0.78rem] text-muted">{finishName} · Sizing kit included</div>
          </div>
          <span className="font-serif font-medium shrink-0">{formatINR(order.unitPrice)}</span>
        </div>

        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2 border-t border-line pt-3">
          <span>Subtotal</span>
          <span>{formatINR(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
            <span>Discount</span>
            <span>−{formatINR(order.discount)}</span>
          </div>
        )}
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
            Total{" "}
            {order.paymentMethod === "cod" && (
              <span className="text-muted text-[0.8rem] font-normal">(pay in full when your sizing kit is delivered)</span>
            )}
          </span>
          <span className="font-serif text-[1.6rem] font-medium">{formatINR(order.total)}</span>
        </div>

        {!cancelled && (
          <p className="flex gap-2 items-center text-[0.85rem] text-muted mt-4 mb-0">
            <Icon name="truck" size={15} /> Your sizing kit ships first: estimated delivery in 4–7 working days to{" "}
            {order.address.city || "your address"}.
          </p>
        )}
      </div>

      {!pending && !cancelled && (
        <div className="bg-surface border border-line rounded-lg p-5 mt-5">
          <h4 className="text-base font-semibold mb-3">Your order arrives in two parcels</h4>
          <ol className="m-0 p-0 list-none flex flex-col gap-3 text-[0.9rem] text-ink-2">
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 shrink-0 rounded-full bg-nav text-white text-[0.8rem] font-semibold grid place-items-center">1</span>
              <span>
                <b className="text-ink">Your sizing kit ships first.</b> It arrives in 4–7 working days. Try the sizers at home.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 shrink-0 rounded-full bg-nav text-white text-[0.8rem] font-semibold grid place-items-center">2</span>
              <span>
                <b className="text-ink">Then your ring.</b> Submit your size from your account and we ship your ring as soon as we have it.
              </span>
            </li>
          </ol>
        </div>
      )}

      {!pending && !cancelled && (
        <div className="flex gap-3.5 items-start bg-gold-tint border border-gold-wash rounded-lg p-5 mt-5">
          <span className="w-10.5 h-10.5 rounded-xl bg-surface shadow-sm text-gold-deep grid place-items-center shrink-0">
            <Icon name="face" size={19} />
          </span>
          <div>
            <h4 className="text-base font-semibold mb-1">Your 2 free consults are reserved</h4>
            <p className="text-[0.9rem] text-ink-2 m-0">
              Once your ring is delivered, book a dermatologist and a dietician session from your account within 30 days.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mt-6">
        <LinkButton variant="dark" href="/account?tab=track">
          Track order
        </LinkButton>
        <LinkButton variant="ghost" href="/consults">
          Consultations
        </LinkButton>
      </div>
    </div>
  );
}
