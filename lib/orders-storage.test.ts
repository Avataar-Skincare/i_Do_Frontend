import { describe, it, expect } from "vitest";
import { mockApi } from "@/tests/fetch-mock";
import { createOrder, verifyPayment, submitSize, getOrder, getMyOrders, type CreateOrderInput } from "@/lib/orders-storage";
import { getCatalog, quoteOrder } from "@/lib/catalog";

const input: CreateOrderInput = {
  finish: "gold",
  paymentMethod: "online",
  customer: { name: "Asha", email: "a@x.in", phone: "9876543210" },
  address: { line: "1 MG Road", city: "Pune", state: "MH", pin: "411001" },
};

describe("API contract v1.0.x calls", () => {
  it("POST /orders carries the Idempotency-Key and no prices", async () => {
    const api = mockApi({ "POST /orders": { status: 201, body: { order: { id: "IDO-1" } } } });
    await createOrder(input, "key-123");
    const call = api.calls[0];
    expect(call.headers["Idempotency-Key"]).toBe("key-123");
    expect(call.body).toEqual(input);
    const sent = JSON.stringify(call.body);
    expect(sent).not.toMatch(/price|amount|total|subtotal|codFee/i);
  });

  it("verify posts the three Razorpay fields to the order", async () => {
    const api = mockApi({ "POST /orders/IDO-1/payment/verify": { body: { id: "IDO-1" } } });
    const proof = { razorpayOrderId: "o", razorpayPaymentId: "p", razorpaySignature: "s" };
    await verifyPayment("IDO-1", proof);
    expect(api.calls[0].body).toEqual(proof);
  });

  it("submitSize always attests the confirmation step", async () => {
    const api = mockApi({ "POST /orders/IDO-1/size": { body: {} } });
    await submitSize("IDO-1", 9);
    expect(api.calls[0].body).toEqual({ usSize: 9, confirmed: true });
  });

  it("reads one order and the owner's list", async () => {
    const api = mockApi({ "GET /orders/IDO-1": { body: { id: "IDO-1" } }, "GET /orders/mine": { body: [] } });
    await getOrder("IDO-1");
    await getMyOrders();
    expect(api.calls.map((c) => c.path)).toEqual(["/orders/IDO-1", "/orders/mine"]);
  });

  it("quote sends only finish, method and PIN", async () => {
    const api = mockApi({ "POST /orders/quote": { body: { total: 1 } }, "GET /catalog": { body: {} } });
    await quoteOrder({ finish: "silver", paymentMethod: "cod", pin: "411001" });
    await getCatalog();
    expect(api.calls[0].body).toEqual({ finish: "silver", paymentMethod: "cod", pin: "411001" });
  });
});
