import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackTimeline } from "@/components/account/TrackTimeline";
import type { Order } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";
import { order } from "@/tests/fixtures";

const [kitDelivered, ringDelivered] = contractOrders as unknown as Order[];

describe("TrackTimeline with the contract's own orders", () => {
  it("shows the date each reached stage happened, in Indian time", () => {
    render(<TrackTimeline order={ringDelivered} />);
    const title = (name: string) => screen.getByRole("heading", { name: new RegExp(name) });
    expect(title("Sizing kit shipped")).toHaveTextContent("21 Oct");
    expect(title("Sizing kit delivered")).toHaveTextContent("24 Oct");
    expect(title("Size submitted")).toHaveTextContent("25 Oct");
    expect(title("Ring shipped")).toHaveTextContent("27 Oct");
    expect(title("Ring delivered")).toHaveTextContent("31 Oct");
  });

  it("shows no date for stages not reached yet", () => {
    render(<TrackTimeline order={kitDelivered} />);
    expect(screen.getByRole("heading", { name: /Size submitted/ })).not.toHaveTextContent(/\d{1,2} \w{3}/);
    expect(screen.getByRole("heading", { name: /Ring delivered/ })).not.toHaveTextContent(/\d{1,2} \w{3}/);
  });

  it("links the courier tracking page with a proper name and AWB", () => {
    render(<TrackTimeline order={ringDelivered} />);
    const links = screen.getAllByRole("link", { name: /Track with Shiprocket/ });
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "https://shiprocket.co/tracking/SR0000000087",
      "https://shiprocket.co/tracking/SR0000000142",
    ]);
    expect(links[1]).toHaveTextContent("AWB SR0000000142");
  });

  it("after the ring arrives, shows the damage-report and warranty dates", () => {
    render(<TrackTimeline order={ringDelivered} />);
    expect(screen.getByText(/Report it by 7 Nov/)).toBeInTheDocument();
    expect(screen.getByText("Warranty until 31 Oct.")).toBeInTheDocument();
  });

  it("does not show those windows before the ring is delivered", () => {
    render(<TrackTimeline order={kitDelivered} />);
    expect(screen.queryByText(/Warranty/)).not.toBeInTheDocument();
  });
});

describe("TrackTimeline states", () => {
  it("a cancelled order shows the date, the reason and the refund line instead of the journey", () => {
    render(
      <TrackTimeline
        order={order({
          status: "cancelled",
          cancelReason: "customer",
          cancelledAt: "2026-10-26T12:00:00+05:30",
          refund: {
            id: "r", amountPaid: 1499900, kitDeduction: 99900, feeDeduction: 0, amount: 1400000, method: "razorpay",
            destinationRequired: false, status: "processing",
          },
        })}
      />,
    );
    expect(screen.getByText("This order was cancelled on 26 Oct.")).toBeInTheDocument();
    expect(screen.getByText("You cancelled this order.")).toBeInTheDocument();
    expect(screen.getByText("Refund of ₹14,000 is on its way.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Sizing kit shipped/ })).not.toBeInTheDocument();
  });

  it("a ring on its way back says so, instead of 'Ring shipped'", () => {
    render(
      <TrackTimeline
        order={order({
          status: "ring_shipped",
          shipments: [{ id: "s", kind: "ring", status: "rto", attempt: 1, courier: "delhivery", awb: "D1", trackingUrl: null, shippedAt: "2026-10-27T10:00:00+05:30" }],
        })}
      />,
    );
    expect(screen.getByRole("heading", { name: /on its way back to us/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^Ring shipped/ })).not.toBeInTheDocument();
  });
});
