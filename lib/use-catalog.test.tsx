import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { mockApi } from "@/tests/fetch-mock";

const CATALOG = { pricePaise: 1499900, finishes: [], codEnabled: true };

function Probe({ useIt }: { useIt: () => unknown }) {
  const c = useIt() as { pricePaise: number } | null;
  return <output>{c ? `price ${c.pricePaise}` : "none"}</output>;
}

beforeEach(() => vi.resetModules()); // the hook keeps one shared request per page load

describe("useCatalog", () => {
  it("is null until the catalog arrives, then the server's values", async () => {
    mockApi({ "GET /catalog": { body: CATALOG } });
    const { useCatalog } = await import("@/lib/use-catalog");
    render(<Probe useIt={useCatalog} />);
    expect(screen.getByRole("status", { hidden: true })).toHaveTextContent("none");
    expect(await screen.findByText("price 1499900")).toBeInTheDocument();
  });

  it("many components share one request", async () => {
    const api = mockApi({ "GET /catalog": { body: CATALOG } });
    const { useCatalog } = await import("@/lib/use-catalog");
    render(<><Probe useIt={useCatalog} /><Probe useIt={useCatalog} /><Probe useIt={useCatalog} /></>);
    await waitFor(() => expect(screen.getAllByText("price 1499900")).toHaveLength(3));
    expect(api.count("GET /catalog")).toBe(1);
  });

  it("stays null when the API is down (pages fall back to their static values), and tries again next time", async () => {
    const api = mockApi({ "GET /catalog": [{ status: 503, body: {} }, { body: CATALOG }] });
    const { useCatalog } = await import("@/lib/use-catalog");
    const first = render(<Probe useIt={useCatalog} />);
    await waitFor(() => expect(api.count("GET /catalog")).toBe(1));
    expect(screen.getByRole("status", { hidden: true })).toHaveTextContent("none");
    first.unmount();
    render(<Probe useIt={useCatalog} />);
    expect(await screen.findByText("price 1499900")).toBeInTheDocument();
    expect(api.count("GET /catalog")).toBe(2);
  });
});
