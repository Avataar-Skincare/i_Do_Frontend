import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SizeSubmit } from "@/components/account/SizeSubmit";
import { mockApi } from "@/tests/fetch-mock";
import type { Order } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";

/** Uses the REAL catalog hook (no stub): GET /catalog over the mocked network, as the browser would. */
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const kit = contractOrders[0] as unknown as Order; // gold
const catalog = {
  pricePaise: 1499900, listPricePaise: 1999900, kitIncluded: true, codFeePaise: 10000, codEnabled: true, offer: { enabled: false }, socialProof: null,
  finishes: [
    { id: "gold", name: "Gold", sizes: [{ us: 8, inStock: true }, { us: 9, inStock: false }] },
    { id: "silver", name: "Silver", sizes: [{ us: 8, inStock: false }, { us: 9, inStock: true }] },
  ],
};

describe("size step with the real catalog request", () => {
  it("marks only this order's finish: gold US 9 is 'ships later', and the confirm step explains it", async () => {
    mockApi({ "GET /catalog": { body: catalog } });
    render(<SizeSubmit order={kit} onSubmitted={() => {}} />);
    const user = userEvent.setup();
    const nine = await screen.findByRole("radio", { name: /US 9.*ships later/ });
    expect(screen.getByRole("radio", { name: /^US 8$/ })).toBeInTheDocument(); // in stock: no tag
    await user.click(nine);
    await user.click(screen.getByRole("button", { name: "Submit size US 9" }));
    expect(screen.getByText(/US 9 isn't on the shelf right now/)).toBeInTheDocument();
    expect(screen.getByText(/Your size is still locked in/)).toBeInTheDocument();
  });

  it("an in-stock size says so", async () => {
    mockApi({ "GET /catalog": { body: catalog } });
    render(<SizeSubmit order={kit} onSubmitted={() => {}} />);
    const user = userEvent.setup();
    await screen.findByRole("radio", { name: /US 9.*ships later/ }); // the catalog has arrived
    await user.click(screen.getByRole("radio", { name: /^US 8$/ }));
    await user.click(screen.getByRole("button", { name: "Submit size US 8" }));
    expect(screen.getByText("US 8 is in stock.")).toBeInTheDocument();
  });
});
