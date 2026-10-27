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

describe("OrderCard: after the size is locked", () => {
  it("says the size is locked, and points to support (ops can still correct it before it ships)", () => {
    render(<OrderCard order={order({ status: "size_submitted", usSize: 9 })} />);
    expect(screen.getByText(/Size US 9 is locked\. Your ring ships next\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/support");
  });
});
