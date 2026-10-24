import { describe, it, expect, vi, beforeEach } from "vitest";
import { payWithRazorpay, PaymentNotCompletedError } from "@/lib/razorpay";

const order = { id: "order_1", amount: 1499900, currency: "INR", keyId: "rzp_test_x" };
const who = { name: "Asha", email: "a@x.in", phone: "9876543210" };

type Opts = {
  key: string; amount: number; order_id: string; prefill: Record<string, string>;
  handler: (r: Record<string, string>) => void; modal: { ondismiss: () => void };
};

function installWidget(behave: (o: Opts) => void) {
  const ctor = vi.fn(function (this: { open: () => void }, o: Opts) {
    this.open = () => behave(o);
  });
  (window as unknown as { Razorpay: unknown }).Razorpay = ctor;
  return ctor;
}

beforeEach(() => {
  delete (window as unknown as { Razorpay?: unknown }).Razorpay;
});

describe("payWithRazorpay", () => {
  it("opens the widget with the server's order and resolves with the three proof fields", async () => {
    const ctor = installWidget((o) =>
      o.handler({ razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig" }),
    );
    const proof = await payWithRazorpay(order, who);
    expect(proof).toEqual({ razorpayOrderId: "order_1", razorpayPaymentId: "pay_1", razorpaySignature: "sig" });
    const o = ctor.mock.calls[0][0] as Opts;
    expect(o).toMatchObject({ key: "rzp_test_x", amount: 1499900, order_id: "order_1" });
    expect(o.prefill).toEqual({ name: "Asha", email: "a@x.in", contact: "9876543210" });
  });

  it("rejects with PaymentNotCompletedError when the customer closes the window", async () => {
    installWidget((o) => o.modal.ondismiss());
    const err = await payWithRazorpay(order, who).catch((e) => e);
    expect(err).toBeInstanceOf(PaymentNotCompletedError);
    expect(err.message).toBe("Payment not completed. Try again.");
  });

  it("loads Checkout.js on demand, and only when the widget is missing", async () => {
    const pending = payWithRazorpay(order, who);
    const script = document.querySelector<HTMLScriptElement>('script[src*="checkout.razorpay.com"]');
    expect(script).not.toBeNull();
    installWidget((o) => o.handler({ razorpay_order_id: "a", razorpay_payment_id: "b", razorpay_signature: "c" }));
    script!.onload!(new Event("load"));
    await expect(pending).resolves.toMatchObject({ razorpayPaymentId: "b" });
  });
});
