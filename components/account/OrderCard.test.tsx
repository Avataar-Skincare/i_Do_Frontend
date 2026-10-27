import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { OrderCard } from "@/components/account/OrderCard";
import type { Order } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";
import { order } from "@/tests/fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));

const [kitDelivered, ringDelivered] = contractOrders as unknown as Order[];
const steps = () => within(screen.getByRole("list", { name: "Order progress" })).getAllByRole("listitem");

describe("OrderCard: the 7-step progress strip", () => {
  it("shows all seven steps and marks the current one", () => {
    render(<OrderCard order={kitDelivered} />);
    expect(steps().map((s) => s.textContent)).toEqual(
      ["Placed", "Confirmed", "Kit shipped", "Kit delivered", "Size submitted", "Ring shipped", "Ring delivered"],
    );
    const current = steps().filter((s) => s.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Kit delivered");
  });

  it("an unpaid or COD-unconfirmed order sits on 'Placed'; a delivered ring on the last step", () => {
    const { unmount } = render(<OrderCard order={order({ status: "cod_pending", paymentMethod: "cod" })} />);
    expect(steps()[0]).toHaveAttribute("aria-current", "step");
    unmount();
    render(<OrderCard order={ringDelivered} />);
    expect(steps()[6]).toHaveAttribute("aria-current", "step");
  });

  it("a cancelled order has no progress strip", () => {
    render(<OrderCard order={order({ status: "cancelled", cancelReason: "customer" })} />);
    expect(screen.queryByRole("list", { name: "Order progress" })).not.toBeInTheDocument();
  });
});

describe("OrderCard: the shipment footer", () => {
  it("shows the kit's delivery date and a tracking link for a kit_delivered order", () => {
    render(<OrderCard order={kitDelivered} />);
    expect(screen.getByText(/^Kit · delivered 30 Oct/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Track with Shiprocket · AWB SR0000000101" })).toHaveAttribute(
      "href",
      "https://shiprocket.co/tracking/SR0000000101",
    );
  });

  it("shows the ring once there is one", () => {
    render(<OrderCard order={ringDelivered} />);
    expect(screen.getByText(/^Ring · delivered 31 Oct/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AWB SR0000000142/ })).toBeInTheDocument();
  });

  it("has no footer before anything has shipped, and none for an unpaid order", () => {
    const { container, unmount } = render(<OrderCard order={order({ status: "confirmed", shipments: [] })} />);
    expect(container.textContent).not.toMatch(/Kit ·|Ring ·/);
    unmount();
    const unpaid = render(<OrderCard order={order({ status: "pending_payment" })} />);
    expect(unpaid.container.textContent).not.toMatch(/Kit ·|Ring ·/);
  });
});

describe("OrderCard: the shipment footer in every parcel state", () => {
  const parcel = (over: Record<string, unknown>) =>
    order({
      status: "kit_shipped",
      shipments: [{ id: "s", kind: "kit", status: "shipped", attempt: 1, courier: "delhivery", awb: "D100", trackingUrl: null, shippedAt: "2026-10-21T16:30:00+05:30", ...over } as never],
    });

  it("a shipped parcel says when it shipped", () => {
    render(<OrderCard order={parcel({})} />);
    expect(screen.getByText(/^Kit · shipped 21 Oct/)).toBeInTheDocument();
  });

  it("an AWB with no tracking URL is plain text, not a link", () => {
    render(<OrderCard order={parcel({})} />);
    expect(screen.getByText(/Track with Delhivery · AWB D100/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /AWB D100/ })).not.toBeInTheDocument();
  });

  it("a ring coming back says so; a lost parcel says so; a parcel being prepared says its status", () => {
    const back = render(<OrderCard order={order({ status: "ring_shipped", shipments: [{ id: "r", kind: "ring", status: "rto", attempt: 1, courier: null, awb: null, trackingUrl: null }] })} />);
    expect(back.container.textContent).toContain("Ring · on its way back");
    back.unmount();
    const lost = render(<OrderCard order={parcel({ status: "lost" })} />);
    expect(lost.container.textContent).toContain("Kit · lost in transit");
    lost.unmount();
    const prep = render(<OrderCard order={parcel({ status: "pending", awb: null, courier: null, shippedAt: null })} />);
    expect(prep.container.textContent).toContain("Kit · pending");
    expect(prep.container.textContent).not.toContain("Track");
  });

  it("names a replacement parcel as such", () => {
    render(<OrderCard order={parcel({ kind: "replacement" })} />);
    expect(screen.getByText(/^Replacement · shipped/)).toBeInTheDocument();
  });
});

describe("OrderCard: after the size is locked", () => {
  it("says the size is locked, and points to support (ops can still correct it before it ships)", () => {
    render(<OrderCard order={order({ status: "size_submitted", usSize: 9 })} />);
    expect(screen.getByText(/Size US 9 is locked\. Your ring ships next\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/support");
  });
});
