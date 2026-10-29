"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  cancelOrder,
  getCancelPreview,
  getOrder,
  type CancelPreview,
  type Order,
  type RefundDestination,
} from "@/lib/orders-storage";

/** Contract patterns (openapi.yaml UpiDestination / BankDestination) — checked here so an obvious typo never costs a round trip. */
const UPI_RE = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;
const ACCOUNT_RE = /^\d{9,18}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** What the server will do with the money, in the customer's words. */
const ROUTE_TEXT: Record<CancelPreview["refundRoute"], string> = {
  razorpay: "Your refund goes back to the card or account you paid with, usually within 5–7 working days.",
  bank_or_upi: "You paid cash on delivery, so we need a UPI ID or bank account to send your refund to.",
  none: "You haven't paid anything yet, so there is nothing to refund.",
  rto_first:
    "Your sizing kit is already on its way. We'll ask the courier to bring it back, and your order stays open until it reaches us. What you get back depends on whether the kit comes back to us.",
};

type Step = "closed" | "preview" | "otp" | "done";

/**
 * Account → Orders → Cancel order. Three things in one flow, in the order the LLD wireframe has
 * them: a server-calculated refund preview, the reason, and — only for a COD order whose kit has
 * been delivered — UPI or bank details behind a fresh step-up OTP.
 *
 * Every amount shown comes from `GET /orders/{id}/cancel-preview`. Nothing here works out what a
 * refund should be: the kit price is deducted once the kit has been delivered (the customer keeps
 * the kit), the ₹100 COD fee is never refunded, and the server owns both numbers.
 */
export function CancelOrder({ order, onOrderChange }: { order: Order; onOrderChange: (order: Order) => void }) {
  const { sendPhoneOtp, stepUp } = useAuth();

  const [step, setStep] = useState<Step>("closed");
  const [preview, setPreview] = useState<CancelPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [reason, setReason] = useState("");
  const [destType, setDestType] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holder, setHolder] = useState("");
  const [code, setCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"cancelled" | "rto_requested" | null>(null);

  const needsDestination = preview?.refundRoute === "bank_or_upi";

  async function open() {
    setStep("preview");
    setError(null);
    setLoadingPreview(true);
    try {
      setPreview(await getCancelPreview(order.id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "We couldn't work out your refund just now. Please try again.",
      );
    } finally {
      setLoadingPreview(false);
    }
  }

  function close() {
    setStep("closed");
    setError(null);
    setCode("");
    setOtpSent(false);
  }

  /** Mirrors the contract's own patterns; the server validates again and owns the final answer. */
  function destinationError(): string | null {
    if (!needsDestination) return null;
    if (destType === "upi") {
      return UPI_RE.test(upiId.trim()) ? null : "That UPI ID doesn't look right. It should look like name@bank.";
    }
    if (!ACCOUNT_RE.test(accountNo.trim())) return "An account number is 9 to 18 digits.";
    if (!IFSC_RE.test(ifsc.trim().toUpperCase())) return "That IFSC code doesn't look right, e.g. HDFC0000001.";
    if (!holder.trim()) return "Please enter the name on the account.";
    return null;
  }

  function destination(): RefundDestination | undefined {
    if (!needsDestination) return undefined;
    return destType === "upi"
      ? { type: "upi", upiId: upiId.trim() }
      : { type: "bank", accountNo: accountNo.trim(), ifsc: ifsc.trim().toUpperCase(), holder: holder.trim() };
  }

  /** COD after kit delivery: the details need a fresh OTP before they may be sent at all. */
  async function requestOtp() {
    const bad = destinationError();
    if (bad) {
      setError(bad);
      return;
    }
    setError(null);
    setSendingOtp(true);
    try {
      await sendPhoneOtp(order.customer.phone);
      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send the code. Please try again in a moment.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function submit() {
    const bad = destinationError();
    if (bad) {
      setError(bad);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (step === "otp") await stepUp(code);
      const res = await cancelOrder(order.id, reason.trim(), destination());
      setOutcome(res.outcome);
      setStep("done");
      onOrderChange(res.order);
    } catch (err) {
      if (err instanceof ApiError && err.code === "STEP_UP_REQUIRED") {
        // The claim expired (it lasts 15 minutes) — send a new code rather than losing the form.
        setError("That code has expired. We've sent you a new one.");
        setCode("");
        setStep("otp");
        void sendPhoneOtp(order.customer.phone).catch(() => {});
      } else if (err instanceof ApiError && err.code === "NOT_CANCELLABLE") {
        // The ring shipped, or ops cancelled it, while this form was open: show the truth.
        setError(err.message);
        getOrder(order.id).then(onOrderChange).catch(() => {});
        setStep("closed");
      } else {
        setError(err instanceof ApiError ? err.message : "We couldn't cancel this order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="mt-4 pt-5 border-t border-line">
        <h4 className="font-serif text-[1.3rem] font-medium mb-1">
          {outcome === "rto_requested" ? "We're bringing your kit back" : "Your order is cancelled"}
        </h4>
        <p className="text-[0.88rem] text-ink-2 mb-0">
          {outcome === "rto_requested"
            ? "We've asked the courier to return your sizing kit. Your order stays open until it reaches us, and we'll confirm your refund then."
            : "You'll see the refund on this order as soon as it's on its way. A credit note is available with your invoices."}
        </p>
      </div>
    );
  }

  if (step === "closed") {
    return (
      <div className="mt-4 pt-3.5 border-t border-line">
        <button
          type="button"
          onClick={() => void open()}
          className="text-[0.85rem] font-semibold text-ink-2 underline hover:text-ink transition-colors"
        >
          Cancel order
        </button>
        {error && (
          <p role="alert" className="text-[0.85rem] text-error mt-2 mb-0">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-5 border-t border-line">
      <h4 className="font-serif text-[1.5rem] font-medium mb-1">Cancel this order</h4>

      {loadingPreview && <p className="text-[0.88rem] text-ink-2">Working out your refund…</p>}

      {!loadingPreview && preview && (
        <>
          {!preview.cancellable ? (
            <p className="text-[0.88rem] text-ink-2">
              This order can&apos;t be cancelled any more.{" "}
              <Link href="/support" className="font-semibold text-gold-deep underline">
                Contact support
              </Link>{" "}
              if something is wrong.
            </p>
          ) : (
            <>
              <dl className="bg-bg-2 border border-line rounded-lg p-4 mb-4 text-[0.88rem]">
                <div className="flex justify-between gap-3 mb-1.5">
                  <dt className="text-ink-2">You paid</dt>
                  <dd className="font-mono m-0">{formatINR(order.amountPaid)}</dd>
                </div>
                {preview.kitPricePaise > 0 && (
                  <div className="flex justify-between gap-3 mb-1.5">
                    <dt className="text-ink-2">Sizing kit (yours to keep)</dt>
                    <dd className="font-mono m-0">−{formatINR(preview.kitPricePaise)}</dd>
                  </div>
                )}
                {preview.codFeePaise > 0 && (
                  <div className="flex justify-between gap-3 mb-1.5">
                    <dt className="text-ink-2">Cash on delivery fee (not refunded)</dt>
                    <dd className="font-mono m-0">−{formatINR(preview.codFeePaise)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 pt-2 border-t border-line font-semibold">
                  <dt>You get back</dt>
                  <dd className="font-mono m-0">{formatINR(preview.refundPaise)}</dd>
                </div>
              </dl>

              <p className="text-[0.85rem] text-ink-2 mb-4">{ROUTE_TEXT[preview.refundRoute]}</p>

              <label className="block text-[0.85rem] font-semibold mb-1.5" htmlFor="cancel-reason">
                Why are you cancelling?
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                maxLength={500}
                rows={2}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                className="w-full border-[1.5px] border-line-2 rounded-lg p-3 text-[0.9rem] bg-surface mb-4 disabled:opacity-60"
              />

              {needsDestination && (
                <fieldset className="border border-line rounded-lg p-4 mb-4">
                  <legend className="text-[0.85rem] font-semibold px-1.5">Where should we send your refund?</legend>

                  <div role="radiogroup" aria-label="Refund method" className="flex gap-2 mb-3.5">
                    {(["upi", "bank"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={destType === t}
                        disabled={submitting}
                        onClick={() => {
                          setDestType(t);
                          setError(null);
                        }}
                        className={[
                          "py-2 px-5 rounded-pill border-[1.5px] text-[0.85rem] font-semibold transition-colors",
                          destType === t ? "bg-nav border-nav text-white" : "border-line-2 bg-surface text-ink hover:border-gold",
                        ].join(" ")}
                      >
                        {t === "upi" ? "UPI" : "Bank account"}
                      </button>
                    ))}
                  </div>

                  {destType === "upi" ? (
                    <>
                      <label className="block text-[0.82rem] text-ink-2 mb-1" htmlFor="cancel-upi">
                        UPI ID
                      </label>
                      <input
                        id="cancel-upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="name@bank"
                        autoComplete="off"
                        disabled={submitting}
                        className="w-full border-[1.5px] border-line-2 rounded-lg p-3 text-[0.9rem] bg-surface disabled:opacity-60"
                      />
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[0.82rem] text-ink-2 mb-1" htmlFor="cancel-holder">
                          Name on the account
                        </label>
                        <input
                          id="cancel-holder"
                          value={holder}
                          maxLength={120}
                          onChange={(e) => setHolder(e.target.value)}
                          autoComplete="off"
                          disabled={submitting}
                          className="w-full border-[1.5px] border-line-2 rounded-lg p-3 text-[0.9rem] bg-surface disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.82rem] text-ink-2 mb-1" htmlFor="cancel-account">
                          Account number
                        </label>
                        <input
                          id="cancel-account"
                          value={accountNo}
                          inputMode="numeric"
                          onChange={(e) => setAccountNo(e.target.value)}
                          autoComplete="off"
                          disabled={submitting}
                          className="w-full border-[1.5px] border-line-2 rounded-lg p-3 text-[0.9rem] bg-surface disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.82rem] text-ink-2 mb-1" htmlFor="cancel-ifsc">
                          IFSC code
                        </label>
                        <input
                          id="cancel-ifsc"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                          placeholder="HDFC0000001"
                          autoComplete="off"
                          disabled={submitting}
                          className="w-full border-[1.5px] border-line-2 rounded-lg p-3 text-[0.9rem] bg-surface disabled:opacity-60"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[0.78rem] text-muted mt-3 mb-0">
                    We encrypt these details, use them only for this refund, and delete them 90 days after it is paid.
                  </p>
                </fieldset>
              )}

              {step === "otp" && (
                <div className="bg-gold-tint border border-gold-wash rounded-lg p-4 mb-4">
                  <label className="block font-semibold mb-1" htmlFor="cancel-otp">
                    Enter the code we sent you
                  </label>
                  <p className="text-[0.82rem] text-ink-2 mb-2.5">
                    {otpSent ? `Sent by SMS to the number on this order.` : "Sending…"} This confirms the refund details
                    are really yours.
                  </p>
                  <input
                    id="cancel-otp"
                    value={code}
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    disabled={submitting}
                    className="w-40 border-[1.5px] border-line-2 rounded-lg p-3 text-[1.1rem] font-mono tracking-[0.3em] bg-surface disabled:opacity-60"
                  />
                </div>
              )}

              <div className="flex gap-2.5 flex-wrap">
                {needsDestination && step === "preview" ? (
                  <button
                    type="button"
                    onClick={() => void requestOtp()}
                    disabled={sendingOtp || reason.trim().length === 0}
                    className="bg-nav text-white font-semibold py-3 px-6 rounded-pill hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? "Sending code…" : "Send me a code"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={submitting || reason.trim().length === 0 || (step === "otp" && code.length !== 6)}
                    className="bg-nav text-white font-semibold py-3 px-6 rounded-pill hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Cancelling…"
                      : preview.refundRoute === "rto_first"
                        ? "Cancel and return the kit"
                        : "Cancel this order"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  disabled={submitting || sendingOtp}
                  className="font-semibold py-3 px-6 rounded-pill border border-line-2 text-ink-2 hover:border-gold transition-colors disabled:opacity-60"
                >
                  Keep my order
                </button>
              </div>
            </>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-[0.85rem] text-error mt-3 mb-0">
          {error}
        </p>
      )}
    </div>
  );
}
