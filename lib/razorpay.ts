import type { PaymentProof, RazorpayCheckout } from "@/lib/orders-storage";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Thrown when the customer closes the widget without paying. Show "Payment not completed. Try again." */
export class PaymentNotCompletedError extends Error {
  constructor() {
    super("Payment not completed. Try again.");
  }
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads the Checkout.js widget once — only when an online payment is actually attempted, not on every page load. */
function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load the payment widget — check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/** Rejects with PaymentNotCompletedError if the customer closes the widget without paying. */
export async function payWithRazorpay(
  order: RazorpayCheckout,
  opts: { name: string; email: string; phone: string }
): Promise<PaymentProof> {
  await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Payment widget failed to load."));
      return;
    }
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "i do",
      description: "Smart ring order",
      prefill: { name: opts.name, email: opts.email, contact: opts.phone },
      theme: { color: "#c0a15b" },
      handler: (response) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new PaymentNotCompletedError()),
      },
    });
    razorpay.open();
  });
}
