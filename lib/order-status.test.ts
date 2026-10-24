import { describe, it, expect } from "vitest";
import {
  ORDER_STATUS_LABEL,
  ORDER_STAGES,
  CANCEL_REASON_TEXT,
  latestShipment,
  ringReturning,
  orderStatusLabel,
  orderStageIndex,
  refundLine,
  returningText,
} from "@/lib/order-status";
import type { Refund, Shipment } from "@/lib/orders-storage";

const ship = (over: Partial<Shipment>): Shipment => ({
  id: "s", kind: "ring", status: "shipped", courier: null, awb: null, trackingUrl: null, ...over,
});
const refund = (over: Partial<Refund>): Refund => ({
  id: "r", amountPaid: 1499900, kitDeduction: 100000, feeDeduction: 0, amount: 1399900,
  method: "razorpay", destinationRequired: false, status: "requested", ...over,
});

describe("order status labels", () => {
  it("has a customer label for all 9 states (LLD 3.1)", () => {
    expect(Object.keys(ORDER_STATUS_LABEL)).toHaveLength(9);
  });
  it("has a customer-facing sentence for every cancel reason", () => {
    expect(Object.keys(CANCEL_REASON_TEXT).sort()).toEqual(
      ["admin", "cod_unconfirmed", "customer", "kit_rto", "ring_refused", "unpaid"],
    );
  });
});

describe("latestShipment / ringReturning", () => {
  it("picks the highest attempt of a kind", () => {
    const shipments = [ship({ id: "a", attempt: 1, status: "rto" }), ship({ id: "b", attempt: 2, status: "shipped" }), ship({ id: "k", kind: "kit" })];
    expect(latestShipment({ shipments }, "ring")?.id).toBe("b");
    expect(latestShipment({ shipments }, "kit")?.id).toBe("k");
    expect(latestShipment({ shipments }, "replacement")).toBeUndefined();
  });
  it("shows 'Ring returning' only while a ring_shipped order's ring shipment is rto", () => {
    const rto = [ship({ status: "rto" })];
    expect(ringReturning({ status: "ring_shipped", shipments: rto })).toBe(true);
    expect(orderStatusLabel({ status: "ring_shipped", shipments: rto })).toBe("Ring returning");
    expect(ringReturning({ status: "cancelled", shipments: rto })).toBe(false);
    expect(orderStatusLabel({ status: "ring_shipped", shipments: [ship({ status: "shipped" })] })).toBe("Ring shipped");
  });
  it("a second delivery attempt that is moving again is no longer 'returning'", () => {
    const shipments = [ship({ attempt: 1, status: "rto" }), ship({ attempt: 2, status: "shipped" })];
    expect(ringReturning({ status: "ring_shipped", shipments })).toBe(false);
  });
});

describe("orderStageIndex", () => {
  it("walks the six-stage journey", () => {
    expect(ORDER_STAGES.map((s) => s.status)).toEqual(
      ["confirmed", "kit_shipped", "kit_delivered", "size_submitted", "ring_shipped", "ring_delivered"],
    );
    expect(orderStageIndex({ status: "size_submitted" })).toBe(3);
  });
  it("parks unpaid and COD-unconfirmed orders on the first stage", () => {
    expect(orderStageIndex({ status: "pending_payment" })).toBe(0);
    expect(orderStageIndex({ status: "cod_pending" })).toBe(0);
  });
});

describe("refundLine", () => {
  it("is null without a refund", () => expect(refundLine(null)).toBeNull());
  it("uses the server's amount and the right wording per status", () => {
    expect(refundLine(refund({ status: "paid" }))).toBe("Refund of ₹13,999 paid.");
    expect(refundLine(refund({ status: "processing" }))).toBe("Refund of ₹13,999 is on its way.");
    expect(refundLine(refund({ status: "requested" }))).toBe("Refund of ₹13,999 requested.");
    expect(refundLine(refund({ status: "rejected" }))).toContain("contact support");
  });
});

describe("returningText", () => {
  it("mentions the ₹100 COD fee only for COD orders", () => {
    expect(returningText({ paymentMethod: "cod" })).toContain("₹100 COD handling fee");
    expect(returningText({ paymentMethod: "online" })).not.toContain("COD");
  });
});
