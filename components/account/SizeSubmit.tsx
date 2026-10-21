"use client";

import { useState } from "react";
import { SIZES } from "@/lib/content/product";
import { formatIstDateTime, daysUntil } from "@/lib/format";
import { useCatalog } from "@/lib/use-catalog";
import { ApiError } from "@/lib/api";
import { getOrder, submitSize, type Order } from "@/lib/orders-storage";

/**
 * Shown on an order whose sizing kit has been delivered (status kit_delivered). The customer picks a
 * US size, sees "You're choosing US N. This can't be changed later. Confirm?", and only then is the
 * size sent with `confirmed: true`. The target date is a reminder, not a cut-off: a size is still
 * accepted after it and the order is never cancelled for a missing size.
 */
export function SizeSubmit({ order, onSubmitted }: { order: Order; onSubmitted: (order: Order) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  // Informational only: sizes the catalog says are not on the shelf right now read "ships later".
  const catalog = useCatalog();
  const inStock = Object.fromEntries(
    (catalog?.finishes.find((f) => f.id === order.finish)?.sizes ?? []).map((s) => [s.us, s.inStock]),
  );

  const due = order.sizeDueAt ?? null;
  const daysLeft = due ? daysUntil(due, now) : null;
  const overdue = due !== null && new Date(due).getTime() < now;

  async function confirmSize() {
    if (selected === null) return;
    setSubmitting(true);
    setError(null);
    try {
      onSubmitted(await submitSize(order.id, selected));
    } catch (err) {
      if (err instanceof ApiError && (err.code === "SIZE_LOCKED" || err.code === "INVALID_TRANSITION")) {
        // Already locked (another tab, or ops changed things): show the truth instead of the form.
        setError(err.message);
        getOrder(order.id)
          .then(onSubmitted)
          .catch(() => {});
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't save your size. Check your connection and try again.");
      }
      setConfirming(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 mt-4 pt-5 border-t border-line">
      <div>
        <h4 className="font-serif text-[1.5rem] font-medium mb-1">Submit your ring size</h4>
        <p className="text-[0.9rem] text-ink-2 mb-4">Use the sizing kit, then pick the size that fits comfortably.</p>

        <div role="radiogroup" aria-label="Ring size" className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {SIZES.map((s) => {
            const on = selected === s.us;
            return (
              <button
                key={s.us}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={confirming || submitting}
                onClick={() => setSelected(s.us)}
                className={[
                  "py-3 rounded-xl border-[1.5px] font-semibold text-[0.9rem] transition-colors disabled:cursor-not-allowed",
                  on ? "bg-nav border-nav text-white" : "border-line-2 bg-surface text-ink hover:border-gold",
                ].join(" ")}
              >
                US {s.us}
                {inStock[s.us] === false && (
                  <span className={["block text-[0.62rem] font-normal", on ? "text-white/80" : "text-muted"].join(" ")}>
                    ships later
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!confirming ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
            className="bg-nav text-white font-semibold py-3.5 px-8 rounded-pill hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selected === null ? "Choose a size" : `Submit size US ${selected}`}
          </button>
        ) : (
          <div role="group" aria-label="Confirm your size" className="bg-gold-tint border border-gold-wash rounded-lg p-4">
            <p className="font-semibold mb-1">You&apos;re choosing US {selected}. This can&apos;t be changed later. Confirm?</p>
            <p className="text-[0.85rem] text-ink-2 mb-3.5">
              Check it against your sizing kit once more: pick the size that fits comfortably.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => void confirmSize()}
                disabled={submitting}
                className="bg-nav text-white font-semibold py-3 px-6 rounded-pill hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving…" : `Confirm US ${selected}`}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="font-semibold py-3 px-6 rounded-pill border border-line-2 text-ink-2 hover:border-gold transition-colors disabled:opacity-60"
              >
                Go back
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-[0.85rem] text-error mt-3 mb-0">
            {error}
          </p>
        )}
      </div>

      {due && (
        <aside className="bg-gold-tint border border-gold-wash rounded-lg p-5 self-start">
          <div className="font-mono text-[0.7rem] tracking-[0.1em] uppercase text-gold-deep mb-2">Target date</div>
          <div className="font-serif text-[1.7rem] font-medium leading-tight">{formatIstDateTime(due)}</div>
          <div className="font-mono text-[1.05rem] mt-1.5">
            {overdue ? "Past the target date" : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
          </div>
          <p className="text-[0.82rem] text-ink-2 mt-2.5 mb-0">
            This is a target, not a deadline: we will remind you, and your ring ships as soon as we have your size.
            {overdue && " You can still submit your size."}
          </p>
        </aside>
      )}
    </div>
  );
}
