"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";
import { CHECKOUT_PERKS, CHECKOUT_DEMO_NOTE } from "@/lib/content/cart";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/account/AuthModal";
import { createOrder, verifyPayment, type CreateOrderInput } from "@/lib/orders-storage";
import { quoteOrder, type FinishId, type PaymentMethod, type Quote } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";
import { payWithRazorpay, PaymentNotCompletedError } from "@/lib/razorpay";
import { ApiError } from "@/lib/api";

/** A quote is only valid for the finish, payment method and PIN it was fetched for. */
type QuoteState = { key: string; quote: Quote };

type Fields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  buyerGstin: string;
  buyerLegalName: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY_FIELDS: Fields = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pin: "",
  buyerGstin: "",
  buyerLegalName: "",
};

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function validate(fields: Fields, wantGstBill: boolean): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = "Enter a valid email";
  if (!/^\d{10}$/.test(fields.phone)) errors.phone = "Enter a 10-digit mobile number";
  if (!fields.address.trim()) errors.address = "Enter your address";
  if (!fields.city.trim()) errors.city = "Enter your city";
  if (!fields.state.trim()) errors.state = "Enter your state";
  if (!/^\d{6}$/.test(fields.pin)) errors.pin = "Enter a 6-digit PIN code";
  if (wantGstBill) {
    if (!GSTIN_RE.test(fields.buyerGstin.toUpperCase())) errors.buyerGstin = "Enter a valid 15-character GSTIN";
    if (!fields.buyerLegalName.trim()) errors.buyerLegalName = "Enter your business name";
  }
  return errors;
}

export function CheckoutForm() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Errors>({});
  const [wantGstBill, setWantGstBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentIncomplete, setPaymentIncomplete] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  const catalog = useCatalog();
  const [quoteState, setQuoteState] = useState<QuoteState | null>(null);
  // One Idempotency-Key per checkout attempt: reused on a retry of the same details
  // (so "Payment not completed. Try again" resumes the same pending order), and a
  // fresh key as soon as anything the order depends on changes.
  const attempt = useRef<{ sig: string; key: string } | null>(null);

  const finishId = (cart[0]?.finishId ?? "gold") as FinishId;
  const pinValid = /^\d{6}$/.test(fields.pin);
  const quoteKey = `${finishId}|${paymentMethod}|${fields.pin}`;
  const quote = quoteState?.key === quoteKey ? quoteState.quote : null;

  // Display figures only: the server prices the order itself (POST /orders re-quotes).
  const subtotal = quote?.subtotal ?? cartSubtotal;
  const codFee = quote ? quote.codFee : paymentMethod === "cod" ? (catalog?.codFeePaise ?? SITE.codFeeInPaise) : 0;
  const total = quote?.total ?? subtotal + codFee;
  const codEnabled = catalog?.codEnabled ?? true;
  const codBlocked = paymentMethod === "cod" && quote !== null && !quote.codAvailable;

  function setField(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    if (!pinValid) return;
    let live = true;
    quoteOrder({ finish: finishId, paymentMethod, pin: fields.pin })
      .then((q) => live && setQuoteState({ key: quoteKey, quote: q }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [finishId, paymentMethod, fields.pin, pinValid, quoteKey]);

  // Prefill from the account once we know who's logged in — doesn't clobber
  // anything the person already typed while browsing. Done while rendering (React's
  // "adjust state when a prop changes" pattern) rather than in an effect.
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setFields((f) => ({
      ...f,
      name: f.name || user.fullName || "",
      email: f.email || user.email || "",
      phone: f.phone || user.phone || "",
    }));
  }

  async function placeOrder() {
    setShowAuthModal(false);
    setSubmitting(true);
    setSubmitError(null);
    setPaymentIncomplete(false);

    const input: CreateOrderInput = {
      finish: finishId,
      paymentMethod,
      customer: { name: fields.name.trim(), email: fields.email.trim(), phone: fields.phone },
      address: { line: fields.address.trim(), city: fields.city.trim(), state: fields.state.trim(), pin: fields.pin },
      ...(wantGstBill
        ? { buyerGstin: fields.buyerGstin.toUpperCase(), buyerLegalName: fields.buyerLegalName.trim() }
        : {}),
    };
    const sig = JSON.stringify(input);
    if (attempt.current?.sig !== sig) attempt.current = { sig, key: crypto.randomUUID() };

    try {
      const { order, razorpay } = await createOrder(input, attempt.current.key);

      if (paymentMethod === "online" && razorpay && order.status === "pending_payment") {
        const proof = await payWithRazorpay(razorpay, {
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
        });
        try {
          await verifyPayment(order.id, proof);
        } catch (err) {
          // A bad signature is a real failure. Anything else (network, timeout): the
          // customer has paid and Razorpay's webhook is the source of truth, so go to
          // /confirm, which keeps checking until the payment settles.
          if (err instanceof ApiError && err.code === "SIGNATURE_INVALID") throw err;
        }
      }

      clearCart();
      router.push(`/confirm?orderId=${order.id}`);
    } catch (err) {
      if (err instanceof PaymentNotCompletedError) {
        setPaymentIncomplete(true);
        setSubmitError(err.message);
      } else if (err instanceof ApiError) {
        if (err.code === "GSTIN_INVALID") setErrors((e) => ({ ...e, buyerGstin: err.message }));
        if (err.status === 401) setShowAuthModal(true);
        if (err.code === "IDEMPOTENCY_KEY_REUSED") {
          // The server saw this key with different details. Drop it so the next attempt is a new order.
          attempt.current = null;
          setSubmitError(err.message || "Your order details changed since the last attempt. Please check them and place the order again.");
        } else if (err.code === "PAYMENT_GATEWAY_UNAVAILABLE") {
          // Same key on retry is right: nothing was created that a retry would duplicate.
          setSubmitError(err.message || "We couldn't reach the payment service. Please try again in a minute.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError("Couldn't place your order — check your connection and try again.");
      }
      setSubmitting(false);
    }
  }

  // After "Payment not completed": start a fresh attempt (new Idempotency-Key, so a new order) instead of resuming the unpaid one.
  function changeDetails() {
    attempt.current = null;
    setPaymentIncomplete(false);
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields, wantGstBill);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (codBlocked) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }
    void placeOrder();
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-[520px] mx-auto text-center py-16">
        <h2 className="font-serif text-3xl font-medium mb-2.5">Your bag is empty</h2>
        <p className="text-muted mb-6">Add a ring to your bag before checking out.</p>
        <LinkButton href="/shop">Shop the ring</LinkButton>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-9 items-start">
      <div>
        <FormSection number={1} title="Contact">
          <Field label="Full name" required error={errors.name}>
            <input value={fields.name} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" className={inputClass(!!errors.name)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                value={fields.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@email.com"
                className={inputClass(!!errors.email)}
              />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input
                value={fields.phone}
                onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile"
                inputMode="numeric"
                className={inputClass(!!errors.phone)}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-[0.9rem] text-ink-2 mt-1 min-h-11 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={wantGstBill}
              onChange={(e) => setWantGstBill(e.target.checked)}
              className="w-5 h-5 accent-gold"
            />
            I need a GST invoice for this order
          </label>

          {wantGstBill && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="GST number" required error={errors.buyerGstin}>
                <input
                  value={fields.buyerGstin}
                  onChange={(e) => setField("buyerGstin", e.target.value.toUpperCase().slice(0, 15))}
                  placeholder="15-character GSTIN"
                  className={inputClass(!!errors.buyerGstin)}
                />
              </Field>
              <Field label="Business name" required error={errors.buyerLegalName}>
                <input
                  value={fields.buyerLegalName}
                  onChange={(e) => setField("buyerLegalName", e.target.value)}
                  placeholder="Registered business name"
                  className={inputClass(!!errors.buyerLegalName)}
                />
              </Field>
            </div>
          )}
        </FormSection>

        <FormSection number={2} title="Shipping address">
          <Field label="Address" required error={errors.address}>
            <input
              value={fields.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="House / flat, street, area"
              className={inputClass(!!errors.address)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" required error={errors.city}>
              <input value={fields.city} onChange={(e) => setField("city", e.target.value)} placeholder="City" className={inputClass(!!errors.city)} />
            </Field>
            <Field label="State" required error={errors.state}>
              <input value={fields.state} onChange={(e) => setField("state", e.target.value)} placeholder="State" className={inputClass(!!errors.state)} />
            </Field>
            <Field label="Pincode" required error={errors.pin}>
              <input
                value={fields.pin}
                onChange={(e) => setField("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit"
                inputMode="numeric"
                className={inputClass(!!errors.pin)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection number={3} title="Payment">
          <div className="flex flex-col gap-3">
            <PaymentOption
              active={paymentMethod === "online"}
              onClick={() => setPaymentMethod("online")}
              title="Pay online"
              badge="Free shipping"
              badgeTone="sage"
              body="UPI, cards, net-banking & wallets via Razorpay. Secure & instant."
            />
            <PaymentOption
              active={paymentMethod === "cod"}
              disabled={!codEnabled}
              onClick={() => setPaymentMethod("cod")}
              title="Cash on Delivery"
              badge={`+${formatINR(SITE.codFeeInPaise)}`}
              badgeTone="gold"
              body={`Pay in full in cash when your sizing kit is delivered. A ${formatINR(SITE.codFeeInPaise)} handling fee applies, and it is never refunded. We confirm every COD order on WhatsApp.`}
            />
          </div>
          <p className="flex gap-2.5 items-start text-[0.82rem] text-muted mt-4">
            <Icon name="lock" size={15} className="shrink-0 mt-0.5" />
            {CHECKOUT_DEMO_NOTE}
          </p>
        </FormSection>
      </div>

      <div className="bg-surface border border-line rounded-lg p-6.5 lg:sticky lg:top-[90px]">
        <h3 className="font-serif text-2xl font-medium mb-5">Your order</h3>
        <div className="flex flex-col gap-3.5 mb-4 pb-4 border-b border-line">
          {cart.map((item) => {
            const meta = [item.finish, /^\d+$/.test(item.size) ? `US ${item.size}` : item.size].filter(Boolean).join(" · ");
            return (
              <div key={`${item.id}-${item.finish}-${item.size}`} className="flex gap-3 items-center">
                <div className="relative w-13 h-13 shrink-0 rounded-lg overflow-hidden border border-line bg-surface-2">
                  <Image src={item.image} alt={item.name} fill sizes="52px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.9rem] font-medium leading-snug">{item.name}</div>
                  <div className="text-[0.78rem] text-muted">{meta}</div>
                </div>
                <span className="font-serif font-medium shrink-0">{formatINR(item.price * item.qty)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
          <span>{codFee ? "COD handling fee" : "Shipping"}</span>
          <span className={codFee ? "" : "text-sage font-semibold"}>{codFee ? formatINR(codFee) : "Free"}</span>
        </div>
        <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-line font-semibold">
          <span>Total</span>
          <span className="font-serif text-[1.7rem] font-medium">{formatINR(total)}</span>
        </div>
        {!quote && <p className="text-[0.78rem] text-muted mt-2 mb-0">Final total confirmed once you enter your PIN code.</p>}
        {codBlocked && (
          <p className="text-[0.85rem] text-error mt-3.5 mb-0" role="alert">
            {quote?.codReason === "cod_disabled"
              ? "Cash on Delivery isn't available right now. Please pay online."
              : "Cash on Delivery isn't available for this pincode. Please pay online."}
          </p>
        )}
        {submitError && (
          <p className="text-[0.85rem] text-error mt-3.5 mb-0" role="alert">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || codBlocked}
          className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-4.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Placing order…" : paymentIncomplete ? "Try payment again" : "Place order"}
        </button>
        {paymentIncomplete && !submitting && (
          <button
            type="button"
            onClick={changeDetails}
            className="w-full mt-2.5 min-h-11 font-semibold text-ink-2 underline"
          >
            Change details
          </button>
        )}
        <div className="flex flex-col gap-2.5 mt-5">
          {CHECKOUT_PERKS.map((perk) => (
            <div key={perk.text} className="flex items-center gap-2.5 text-[0.82rem] text-muted">
              <Icon name={perk.icon} size={15} className="text-sage shrink-0" />
              {perk.text}
            </div>
          ))}
        </div>
      </div>
      </form>
      {showAuthModal && !user && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => void placeOrder()}
          lead="Log in or create an account to place this order — we'll pick up right where you left off."
        />
      )}
    </>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-base focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

function FormSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4.5">
        <span className="w-7 h-7 rounded-full bg-nav text-white font-serif font-bold text-[0.85rem] grid place-items-center">
          {number}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
        {label} {required && <span className="text-gold-deep">*</span>}
      </label>
      {children}
      {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
    </div>
  );
}

function PaymentOption({
  active,
  disabled,
  onClick,
  title,
  badge,
  badgeTone,
  body,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  badge: string;
  badgeTone: "sage" | "gold";
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "text-left flex gap-3.5 items-start p-4.5 rounded-sm border-[1.5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        active ? "border-gold bg-gold-tint" : "border-line-2 bg-surface",
      ].join(" ")}
    >
      <span
        className={[
          "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 grid place-items-center",
          active ? "border-gold" : "border-line-2",
        ].join(" ")}
      >
        {active && <span className="w-2.5 h-2.5 rounded-full bg-gold" />}
      </span>
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="text-[0.98rem] font-semibold">{title}</h4>
          <span
            className={[
              "text-[0.68rem] font-bold py-0.5 px-2 rounded-pill",
              badgeTone === "sage" ? "bg-sage-bg text-sage" : "bg-gold-wash text-gold-deep",
            ].join(" ")}
          >
            {badge}
          </span>
        </div>
        <p className="text-[0.85rem] text-muted m-0">{body}</p>
      </div>
    </button>
  );
}
