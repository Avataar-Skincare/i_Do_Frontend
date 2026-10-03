"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
import { saveOrder } from "@/lib/orders-storage";
import { createRazorpayOrder, payWithRazorpay } from "@/lib/razorpay";
import { ApiError } from "@/lib/api";

type PaymentMethod = "online" | "cod";

type Fields = { name: string; email: string; phone: string; address: string; city: string; state: string; pin: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY_FIELDS: Fields = { name: "", email: "", phone: "", address: "", city: "", state: "", pin: "" };

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = "Enter a valid email";
  if (!/^\d{10}$/.test(fields.phone)) errors.phone = "Enter a 10-digit mobile number";
  if (!fields.address.trim()) errors.address = "Enter your address";
  if (!fields.city.trim()) errors.city = "Enter your city";
  if (!fields.state.trim()) errors.state = "Enter your state";
  if (!/^\d{6}$/.test(fields.pin)) errors.pin = "Enter a 6-digit PIN code";
  return errors;
}

export function CheckoutForm() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Errors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const codFee = paymentMethod === "cod" ? SITE.codFeeInPaise : 0;
  const total = cartSubtotal + codFee;

  function setField(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // Prefill from the account once we know who's logged in — doesn't clobber
  // anything the person already typed while browsing.
  useEffect(() => {
    if (!user) return;
    setFields((f) => ({
      ...f,
      name: f.name || user.fullName || "",
      email: f.email || user.email || "",
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  async function placeOrder() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const basePayload = {
        items: cart,
        subtotal: cartSubtotal,
        codFee,
        total,
        paymentMethod,
        customer: { name: fields.name, email: fields.email, phone: fields.phone },
        address: { line: fields.address, city: fields.city, state: fields.state, pin: fields.pin },
      };

      let saved;
      if (paymentMethod === "online") {
        // Order only gets created in our DB after a real, verified Razorpay payment —
        // never before. See OrdersService.create on the backend for the signature check.
        const razorpayOrder = await createRazorpayOrder(total);
        const payment = await payWithRazorpay(razorpayOrder, {
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
        });
        saved = await saveOrder({ ...basePayload, ...payment });
      } else {
        saved = await saveOrder(basePayload);
      }

      clearCart();
      router.push(`/confirm?orderId=${saved.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't place your order — check your connection and try again."
      );
      setSubmitting(false);
    }
  }

  // Logging in inside the modal re-renders this with a `user` for the first
  // time — if that happened while the modal was open for this exact reason,
  // finish placing the order immediately instead of making them click twice.
  useEffect(() => {
    if (showAuthModal && user) {
      setShowAuthModal(false);
      void placeOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

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
              onClick={() => setPaymentMethod("cod")}
              title="Cash on Delivery"
              badge={`+${formatINR(SITE.codFeeInPaise)}`}
              badgeTone="gold"
              body="Pay in cash when your ring arrives. A small ₹50 handling fee applies."
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
            const meta = [item.finish, item.size && `US ${item.size}`, `Qty ${item.qty}`].filter(Boolean).join(" · ");
            return (
              <div key={`${item.id}-${item.finish}-${item.size}`} className="flex gap-3 items-center">
                <div className="relative w-13 h-13 shrink-0 rounded-lg overflow-hidden border border-line bg-surface-2">
                  <Image src={item.image} alt={item.name} fill sizes="52px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.9rem] font-medium truncate">{item.name}</div>
                  <div className="text-[0.78rem] text-muted">{meta}</div>
                </div>
                <span className="font-serif font-medium shrink-0">{formatINR(item.price * item.qty)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
          <span>Subtotal</span>
          <span>{formatINR(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-[0.94rem] text-ink-2">
          <span>Shipping</span>
          <span className={codFee ? "" : "text-sage font-semibold"}>{codFee ? formatINR(codFee) : "Free"}</span>
        </div>
        <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-line font-semibold">
          <span>Total</span>
          <span className="font-serif text-[1.7rem] font-medium">{formatINR(total)}</span>
        </div>
        {submitError && (
          <p className="text-[0.85rem] text-error mt-3.5 mb-0">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-4.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
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
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          lead="Log in or create an account to place this order — we'll pick up right where you left off."
        />
      )}
    </>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold",
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
  onClick,
  title,
  badge,
  badgeTone,
  body,
}: {
  active: boolean;
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
      className={[
        "text-left flex gap-3.5 items-start p-4.5 rounded-sm border-[1.5px] transition-colors",
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
