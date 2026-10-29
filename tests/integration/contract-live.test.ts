// @vitest-environment node
/**
 * Integration test against a server that speaks the API contract, over real HTTP (no stubbed fetch).
 * Prism validates every request body and header against api/openapi.yaml (422 if we send something the
 * contract does not allow) and answers with the contract's own example responses, which our response
 * check then has to accept. Skipped unless CONTRACT_URL is set:
 *
 *   cd ../i_Do_Backend && npx @stoplight/prism-cli mock api/openapi.yaml -p 4010 &
 *   pnpm test:contract
 *
 * Point it at a real backend (CONTRACT_URL=https://test-api.idowellness.ai, CONTRACT_REAL=1) only with a
 * valid session cookie in CONTRACT_COOKIE: it then checks the real server against the same expectations.
 * (The write tests create an order and a payment, so use a test environment only.)
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

const BASE = process.env.CONTRACT_URL;
const COOKIE = process.env.CONTRACT_COOKIE ?? "ido_at=contract-test";

type Api = {
  orders: typeof import("@/lib/orders-storage");
  catalog: typeof import("@/lib/catalog");
  consults: typeof import("@/lib/consults-storage");
  http: typeof import("@/lib/api");
};
let api: Api;

describe.skipIf(!BASE)("API contract, live over HTTP", () => {
  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", BASE!);
    api = {
      orders: await import("@/lib/orders-storage"),
      catalog: await import("@/lib/catalog"),
      consults: await import("@/lib/consults-storage"),
      http: await import("@/lib/api"),
    };
  });

  const realFetch = globalThis.fetch;
  // Node has no cookie jar: add the session cookie the browser would have sent. Re-installed before every
  // test because tests/setup.ts removes stubbed globals after each one.
  beforeEach(() => {
    vi.stubGlobal("fetch", (url: string, init: RequestInit = {}) =>
      realFetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Cookie: COOKIE } }),
    );
  });

  it("GET /catalog: price, COD fee and stock per finish", async () => {
    const c = await api.catalog.getCatalog();
    expect(c.pricePaise).toBeGreaterThan(0);
    expect(c.finishes.map((f) => f.id).sort()).toEqual(["black", "gold", "silver"]);
    expect(c.finishes[0].sizes[0]).toHaveProperty("inStock");
  });

  it("POST /orders/quote: our request is valid, the answer has the totals", async () => {
    const q = await api.catalog.quoteOrder({ finish: "gold", paymentMethod: "cod", pin: "411001" });
    expect(q.total).toBeGreaterThan(0);
    expect(typeof q.codAvailable).toBe("boolean");
  });

  it("GET /orders/mine: every order passes our response check and has what the screens use", async () => {
    const orders = await api.orders.getMyOrders();
    expect(orders.length).toBeGreaterThan(0);
    for (const o of orders) {
      expect(Array.isArray(o.shipments)).toBe(true);
      expect(typeof o.total).toBe("number");
      expect(o.customer.phone).toMatch(/^\d{10}$/);
    }
  });

  it("GET /orders/{id}: each listed order can be read by id and passes the response check", async () => {
    for (const o of await api.orders.getMyOrders()) {
      const one = await api.orders.getOrder(o.id);
      // The Prism mock answers every id with its first example; a real server must return the same order.
      if (process.env.CONTRACT_REAL === "1") expect(one.id).toBe(o.id);
      expect(Array.isArray(one.shipments)).toBe(true);
    }
  });

  it("POST /orders: our create-order body and Idempotency-Key are accepted, the answer has the Razorpay order", async () => {
    const res = await api.orders.createOrder(
      {
        finish: "gold",
        paymentMethod: "online",
        customer: { name: "Asha Rao", email: "asha@example.com", phone: "9876543210" },
        address: { line: "1 MG Road", city: "Pune", state: "Maharashtra", pin: "411001" },
      },
      crypto.randomUUID(),
    );
    api.orders.assertOrder(res.order);
    expect(res.razorpay?.keyId).toBeTruthy();
  });

  it("POST /orders/{id}/payment/verify and /size: our bodies are accepted and return an order", async () => {
    const verified = await api.orders.verifyPayment("IDO-7K3Q9M2X4P", {
      razorpayOrderId: "order_x", razorpayPaymentId: "pay_x", razorpaySignature: "sig_x",
    });
    api.orders.assertOrder(verified);
    const locked = api.orders.assertOrder(await api.orders.submitSize("IDO-7K3Q9M2X4P", 9));
    // What the card and strip rely on after a size submit: the order is locked on a size.
    expect(locked.status).toBe("size_submitted");
    expect(locked.usSize).not.toBeNull();
  });

  it("GET /orders/{id}/cancel-preview: the server's refund breakdown is contract-shaped", async () => {
    const p = await api.orders.getCancelPreview("IDO-7K3Q9M2X4P");
    expect(typeof p.cancellable).toBe("boolean");
    for (const n of [p.refundPaise, p.kitPricePaise, p.codFeePaise]) {
      expect(Number.isInteger(n)).toBe(true); // integer paise, never a rupee float
      expect(n).toBeGreaterThanOrEqual(0);
    }
    // The screen switches on this; an unknown value would silently render nothing.
    expect(["razorpay", "bank_or_upi", "none", "rto_first"]).toContain(p.refundRoute);
  });

  it("POST /orders/{id}/cancel: a prepaid cancel body is accepted and returns an order", async () => {
    const res = await api.orders.cancelOrder("IDO-7K3Q9M2X4P", "Changed my mind");
    expect(["cancelled", "rto_requested"]).toContain(res.outcome);
    api.orders.assertOrder(res.order); // the same response check the account screens rely on
  });

  it("POST /orders/{id}/cancel: a COD cancel with UPI details passes the contract's validation", async () => {
    const res = await api.orders.cancelOrder("IDO-7K3Q9M2X4P", "Bought one elsewhere", {
      type: "upi",
      upiId: "kavya.example@okx",
    });
    api.orders.assertOrder(res.order);
  });

  it("POST /orders/{id}/cancel: bank details in our shape are accepted", async () => {
    const res = await api.orders.cancelOrder("IDO-7K3Q9M2X4P", "No longer needed", {
      type: "bank",
      accountNo: "000011112222",
      ifsc: "HDFC0000001",
      holder: "Rohan Mehta",
    });
    api.orders.assertOrder(res.order);
  });

  it("PUT /orders/{id}/refund-destination: accepted, and only the last 4 come back", async () => {
    const refund = await api.orders.setRefundDestination("IDO-7K3Q9M2X4P", {
      type: "upi",
      upiId: "rohan.example@okx",
    });
    expect(typeof refund.destinationRequired).toBe("boolean");
    expect(["requested", "processing", "paid", "rejected"]).toContain(refund.status);
    // Full UPI ids and account numbers must never reach the browser.
    expect(JSON.stringify(refund)).not.toContain("rohan.example@okx");
  });

  it("a malformed UPI id is refused by the contract, not silently accepted", async () => {
    const bad = api.orders.cancelOrder("IDO-7K3Q9M2X4P", "Changed my mind", {
      type: "upi",
      upiId: "not-a-upi-id",
    });
    await expect(bad).rejects.toBeInstanceOf(api.http.ApiError);
  });

  it("a malformed IFSC is refused by the contract", async () => {
    const bad = api.orders.cancelOrder("IDO-7K3Q9M2X4P", "Changed my mind", {
      type: "bank",
      accountNo: "000011112222",
      ifsc: "HDFC1",
      holder: "Rohan Mehta",
    });
    await expect(bad).rejects.toBeInstanceOf(api.http.ApiError);
  });

  it("an empty cancel reason is refused: the contract requires the customer's own words", async () => {
    await expect(api.orders.cancelOrder("IDO-7K3Q9M2X4P", "")).rejects.toBeInstanceOf(api.http.ApiError);
  });

  it("GET /consults/mine: the fields the Consults tab shows are there", async () => {
    const [c] = await api.consults.getMyConsults();
    expect(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).toContain(c.status);
    expect(api.consults.consultWhen(c)).not.toMatch(/undefined/);
  });

  it("a request the contract forbids is refused, and surfaces as an ApiError", async () => {
    const bad = api.orders.submitSize("IDO-7K3Q9M2X4P", 99); // size outside 6..13
    await expect(bad).rejects.toBeInstanceOf(api.http.ApiError);
  });
});
