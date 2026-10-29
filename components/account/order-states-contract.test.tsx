import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth-context";
import { OrderCard } from "@/components/account/OrderCard";
import { TrackTimeline } from "@/components/account/TrackTimeline";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));
// OrderCard's Cancel flow reads the auth context (it needs a step-up OTP for COD refund details).
// Nothing here opens that form, so the provider just has to exist; no session is needed.
vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));

const statuses = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];
const bases = contractOrders as unknown as Order[];

describe("every order state, built from the contract's example orders, renders without breaking", () => {
  for (const status of statuses) {
    for (const [i, base] of bases.entries()) {
      it(`${status} (example ${i + 1})`, () => {
        const o: Order = {
          ...base,
          status,
          cancelReason: status === "cancelled" ? "customer" : null,
          cancelledAt: status === "cancelled" ? "2026-10-26T12:00:00+05:30" : null,
        };
        const card = render(
          <AuthProvider>
            <OrderCard order={o} showTotal onOrderChange={() => {}} />
          </AuthProvider>,
        );
        expect(card.container.textContent).toContain(o.id);
        expect(card.container.textContent).not.toMatch(/undefined|NaN|\[object/);
        card.unmount();
        const line = render(<TrackTimeline order={o} />);
        expect(line.container.textContent).not.toMatch(/undefined|NaN|\[object/);
        line.unmount();
      });
    }
  }

  it("covers all 9 states of the order state machine", () => {
    expect(statuses).toHaveLength(9);
    expect(screen.queryByText("x")).toBeNull();
  });
});
