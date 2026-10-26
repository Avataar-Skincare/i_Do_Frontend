import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackTab } from "@/components/account/TrackTab";
import type { Order } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const orders = contractOrders as unknown as Order[];

describe("TrackTab", () => {
  it("with no orders, says there is nothing to track", () => {
    render(<TrackTab orders={[]} />);
    expect(screen.getByText("Nothing to track")).toBeInTheDocument();
  });

  it("follows the newest order first and switches when another is picked", async () => {
    const user = userEvent.setup();
    render(<TrackTab orders={orders} />);
    expect(screen.getByText("Tracking IDO-7K3Q9M2X4P")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "IDO-3M8T1V6R0N" }));
    expect(screen.getByText("Tracking IDO-3M8T1V6R0N")).toBeInTheDocument();
    expect(screen.getByText(/Warranty until/)).toBeInTheDocument();
  });

  it("with a single order there is no order picker", () => {
    render(<TrackTab orders={[orders[0]]} />);
    expect(screen.queryByText("Your recent orders")).not.toBeInTheDocument();
  });
});
