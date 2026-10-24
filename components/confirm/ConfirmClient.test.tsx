import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ConfirmClient } from "@/components/confirm/ConfirmClient";
import { mockApi } from "@/tests/fetch-mock";
import { order } from "@/tests/fixtures";

const params = vi.hoisted(() => ({ orderId: "IDO-ABC123" as string | null }));
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => params.orderId }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

beforeEach(() => {
  params.orderId = "IDO-ABC123";
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => vi.useRealTimers());

const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe("ConfirmClient", () => {
  it("with no orderId there is nothing to confirm", async () => {
    params.orderId = null;
    mockApi({});
    render(<ConfirmClient />);
    expect(await screen.findByText("Nothing to confirm yet")).toBeInTheDocument();
  });

  it("an unreadable order (someone else's, or signed out) reads as nothing to confirm", async () => {
    mockApi({ "GET /orders/IDO-ABC123": { status: 403, body: { message: "no" } } });
    render(<ConfirmClient />);
    expect(await screen.findByText("Nothing to confirm yet")).toBeInTheDocument();
  });

  it("a paid order shows the welcome, two parcels and the reserved consults", async () => {
    mockApi({ "GET /orders/IDO-ABC123": { body: order({ status: "confirmed" }) } });
    render(<ConfirmClient />);
    expect(await screen.findByText(/Welcome to i do/)).toBeInTheDocument();
    expect(screen.getByText("Your order arrives in two parcels")).toBeInTheDocument();
    expect(screen.getByText("Your 2 free consults are reserved")).toBeInTheDocument();
    expect(screen.getByText("₹14,999", { selector: "span.text-\\[1\\.6rem\\]" })).toBeInTheDocument();
  });

  it("polls every 4 s while the payment settles, then flips to confirmed", async () => {
    const api = mockApi({
      "GET /orders/IDO-ABC123": [
        { body: order({ status: "pending_payment" }) },
        { body: order({ status: "pending_payment" }) },
        { body: order({ status: "confirmed" }) },
      ],
    });
    render(<ConfirmClient />);
    expect(await screen.findByText("Hold on a moment")).toBeInTheDocument();
    expect(screen.queryByText("Your order arrives in two parcels")).not.toBeInTheDocument();
    await tick(4000);
    await tick(4000);
    expect(await screen.findByText(/Welcome to i do/)).toBeInTheDocument();
    expect(api.count("GET /orders/IDO-ABC123")).toBe(3);
    await tick(20_000);
    expect(api.count("GET /orders/IDO-ABC123")).toBe(3); // stops polling once settled
  });

  it("gives up after about 12 minutes with a calm explanation", async () => {
    const api = mockApi({ "GET /orders/IDO-ABC123": { body: order({ status: "pending_payment" }) } });
    render(<ConfirmClient />);
    await screen.findByText("Hold on a moment");
    await tick(12 * 60 * 1000 + 5000);
    expect(screen.getByText(/haven't received the confirmation from your bank yet/)).toBeInTheDocument();
    const calls = api.count("GET /orders/IDO-ABC123");
    await tick(60_000);
    expect(api.count("GET /orders/IDO-ABC123")).toBe(calls);
  });

  it("a COD order says we'll confirm it, and shows the COD fee and pay-on-kit-delivery note", async () => {
    mockApi({
      "GET /orders/IDO-ABC123": {
        body: order({ status: "cod_pending", paymentMethod: "cod", codFee: 10000, total: 1509900, amountPaid: 0 }),
      },
    });
    render(<ConfirmClient />);
    expect(await screen.findByText(/confirm your Cash on Delivery order/)).toBeInTheDocument();
    expect(screen.getByText("COD handling")).toBeInTheDocument();
    expect(screen.getByText(/pay in full when your sizing kit is delivered/)).toBeInTheDocument();
  });

  it("a cancelled order says so and hides the parcel explainer", async () => {
    mockApi({ "GET /orders/IDO-ABC123": { body: order({ status: "cancelled", cancelReason: "unpaid" }) } });
    render(<ConfirmClient />);
    expect(await screen.findByText("This order was cancelled")).toBeInTheDocument();
    expect(screen.queryByText("Your order arrives in two parcels")).not.toBeInTheDocument();
  });
});
