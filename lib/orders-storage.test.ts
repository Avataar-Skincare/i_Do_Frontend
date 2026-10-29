import { describe, it, expect } from "vitest";
import { mockApi } from "@/tests/fetch-mock";
import {
  createOrder, verifyPayment, submitSize, getOrder, getMyOrders, assertOrder, UnexpectedResponseError,
  canRequestCancel, getCancelPreview, cancelOrder, setRefundDestination,
  type CreateOrderInput, type Order, type OrderStatus,
} from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";
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
    const api = mockApi({ "GET /orders/IDO-1": { body: contractOrders[0] }, "GET /orders/mine": { body: contractOrders } });
    expect((await getOrder("IDO-1")).id).toBe(contractOrders[0].id);
    expect(await getMyOrders()).toHaveLength(2);
    expect(api.calls.map((c) => c.path)).toEqual(["/orders/IDO-1", "/orders/mine"]);
  });

  it("quote sends only finish, method and PIN", async () => {
    const api = mockApi({ "POST /orders/quote": { body: { total: 1 } }, "GET /catalog": { body: {} } });
    await quoteOrder({ finish: "silver", paymentMethod: "cod", pin: "411001" });
    await getCatalog();
    expect(api.calls[0].body).toEqual({ finish: "silver", paymentMethod: "cod", pin: "411001" });
  });
});

describe("response check: only contract-shaped orders reach the screens", () => {
  it("accepts every order in the contract's examples", () => {
    for (const o of contractOrders) expect(assertOrder(o).id).toBe(o.id);
  });

  it("rejects an older backend's raw row (no shipments array) with a readable error", async () => {
    const rawRow = { id: "IDO-1", status: "placed", customer: { name: "A" }, createdAt: "2026-10-20T10:00:00Z" };
    mockApi({ "GET /orders/mine": { body: [rawRow] }, "GET /orders/IDO-1": { body: rawRow } });
    await expect(getMyOrders()).rejects.toBeInstanceOf(UnexpectedResponseError);
    await expect(getOrder("IDO-1")).rejects.toThrow(/expected format/);
  });

  it("rejects an order with a valid status but no shipments list (the field the timeline reads)", () => {
    const { shipments: _omit, ...withoutShipments } = contractOrders[0];
    void _omit;
    expect(() => assertOrder(withoutShipments)).toThrow(UnexpectedResponseError);
    expect(() => assertOrder({ ...contractOrders[0], shipments: null })).toThrow(UnexpectedResponseError);
  });

  it("rejects an unknown status and a non-array list", async () => {
    expect(() => assertOrder({ ...contractOrders[0], status: "placed" })).toThrow(UnexpectedResponseError);
    mockApi({ "GET /orders/mine": { body: { message: "nope" } } });
    await expect(getMyOrders()).rejects.toBeInstanceOf(UnexpectedResponseError);
  });
});


describe("cancel & refunds: the calls the account screen makes", () => {
  const cancelled = { ...contractOrders[0], status: "cancelled", cancelReason: "customer" };

  it("canRequestCancel is true in exactly the four statuses the contract allows", () => {
    const allowed: OrderStatus[] = ["confirmed", "kit_shipped", "kit_delivered", "size_submitted"];
    const blocked: OrderStatus[] = ["pending_payment", "cod_pending", "ring_shipped", "ring_delivered", "cancelled"];
    for (const status of allowed) expect(canRequestCancel({ status } as Order)).toBe(true);
    for (const status of blocked) expect(canRequestCancel({ status } as Order)).toBe(false);
    expect(allowed.length + blocked.length).toBe(9); // all 9 states of the machine are decided
  });

  it("the preview is read, never computed: one GET, no body", async () => {
    const preview = { cancellable: true, refundPaise: 1400000, kitPricePaise: 99900, codFeePaise: 0, refundRoute: "razorpay" };
    const api = mockApi({ "GET /orders/IDO-1/cancel-preview": { body: preview } });
    expect(await getCancelPreview("IDO-1")).toEqual(preview);
    expect(api.calls[0].method).toBe("GET");
    expect(api.calls[0].body).toBeUndefined();
  });

  it("a prepaid cancel sends the reason alone — no destination key at all", async () => {
    const api = mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: cancelled } } });
    const res = await cancelOrder("IDO-1", "Changed my mind");
    expect(api.calls[0].body).toEqual({ reason: "Changed my mind" });
    expect(res.outcome).toBe("cancelled");
    expect(res.order.id).toBe(cancelled.id);
  });

  it("a COD cancel sends the UPI destination in the contract's shape", async () => {
    const api = mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: cancelled } } });
    await cancelOrder("IDO-1", "Bought one elsewhere", { type: "upi", upiId: "kavya.example@okx" });
    expect(api.calls[0].body).toEqual({
      reason: "Bought one elsewhere",
      destination: { type: "upi", upiId: "kavya.example@okx" },
    });
  });

  it("a bank destination carries exactly accountNo, ifsc and holder", async () => {
    const api = mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: cancelled } } });
    await cancelOrder("IDO-1", "No longer needed", {
      type: "bank", accountNo: "000011112222", ifsc: "HDFC0000001", holder: "Rohan Mehta",
    });
    expect(api.calls[0].body).toEqual({
      reason: "No longer needed",
      destination: { type: "bank", accountNo: "000011112222", ifsc: "HDFC0000001", holder: "Rohan Mehta" },
    });
  });

  it("never sends an amount — the server decides what comes back", async () => {
    const api = mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: cancelled } } });
    await cancelOrder("IDO-1", "Changed my mind", { type: "upi", upiId: "a.b@okx" });
    expect(JSON.stringify(api.calls[0].body)).not.toMatch(/paise|amount|refund|total|price/i);
  });

  it("rto_requested comes back with the order still in its old state", async () => {
    const stillShipped = { ...contractOrders[0], status: "kit_shipped" };
    mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "rto_requested", order: stillShipped } } });
    const res = await cancelOrder("IDO-1", "Changed my mind");
    expect(res.outcome).toBe("rto_requested");
    expect(res.order.status).toBe("kit_shipped");
  });

  it("the cancel response goes through the same response check as any order", async () => {
    mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: { id: "IDO-1", status: "placed" } } } });
    await expect(cancelOrder("IDO-1", "Changed my mind")).rejects.toBeInstanceOf(UnexpectedResponseError);
  });

  it("the contract's error codes arrive as ApiError.code for the screen to branch on", async () => {
    mockApi({
      "POST /orders/IDO-1/cancel": {
        status: 409,
        body: { message: "Your ring has already shipped, so this order can't be cancelled.", code: "NOT_CANCELLABLE" },
      },
    });
    await expect(cancelOrder("IDO-1", "Changed my mind")).rejects.toMatchObject({
      status: 409,
      code: "NOT_CANCELLABLE",
    });
  });

  it("setRefundDestination is a PUT on the refund-destination path", async () => {
    const refund = { id: "r1", orderId: "IDO-1", amount: 1300100, destinationRequired: false, status: "requested" };
    const api = mockApi({ "PUT /orders/IDO-1/refund-destination": { body: refund } });
    expect(await setRefundDestination("IDO-1", { type: "upi", upiId: "rohan.example@okx" })).toEqual(refund);
    expect(api.calls[0].method).toBe("PUT");
    expect(api.calls[0].body).toEqual({ type: "upi", upiId: "rohan.example@okx" });
  });

  it("every cancel call carries the cookie session and the CSRF header", async () => {
    const api = mockApi({ "POST /orders/IDO-1/cancel": { body: { outcome: "cancelled", order: cancelled } } });
    await cancelOrder("IDO-1", "Changed my mind");
    expect(api.calls[0].credentials).toBe("include");
    expect(api.calls[0].headers["X-Requested-With"]).toBe("ido");
  });
});
