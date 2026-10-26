import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { mockApi } from "@/tests/fetch-mock";
import { USER } from "@/tests/fixtures";
import contractOrders from "@/tests/contract/orders-mine.json";
import contractConsults from "@/tests/contract/consults-mine.json";

const nav = vi.hoisted(() => ({ tab: null as string | null }));
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => nav.tab }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));

/** The number shown above a stat label (the label text also appears in the side menu). */
const stat = (label: string) => screen.getAllByText(label).find((el) => el.previousElementSibling?.classList.contains("font-serif"))!.previousElementSibling;

const me = { "GET /auth/me": { body: USER } };

async function open(routes: Record<string, object>, tab: string | null = null) {
  nav.tab = tab;
  const api = mockApi({ ...me, ...routes } as never);
  render(<AuthProvider><AccountDashboard /></AuthProvider>);
  return { api, user: userEvent.setup() };
}

describe("Account with the contract's real responses", () => {
  it("overview counts the orders and consults and shows the latest order's status", async () => {
    await open({ "GET /orders/mine": { body: contractOrders }, "GET /consults/mine": { body: contractConsults } });
    expect(await screen.findByText("Hi Asha 🤍")).toBeInTheDocument();
    expect(await screen.findByText("Latest order")).toBeInTheDocument();
    expect(stat("Orders")).toHaveTextContent("2");
    expect(stat("Consults booked")).toHaveTextContent("1");
    expect(screen.getAllByText("Sizing kit delivered").length).toBeGreaterThan(0);
  });

  it("the Orders tab lists each order with its total", async () => {
    await open({ "GET /orders/mine": { body: contractOrders }, "GET /consults/mine": { body: [] } }, "orders");
    expect(await screen.findByText("IDO-7K3Q9M2X4P")).toBeInTheDocument();
    expect(screen.getByText("IDO-3M8T1V6R0N")).toBeInTheDocument();
    expect(screen.getByText("₹15,099")).toBeInTheDocument(); // the COD order, fee included
    expect(screen.getByText("Submit your ring size")).toBeInTheDocument(); // the kit_delivered one
  });

  it("the Track tab shows real dates and the courier link", async () => {
    await open({ "GET /orders/mine": { body: contractOrders }, "GET /consults/mine": { body: [] } }, "track");
    expect(await screen.findByText("Tracking IDO-7K3Q9M2X4P")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AWB SR0000000101/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sizing kit delivered/ })).toHaveTextContent("30 Oct");
  });

  it("the Consults tab shows the confirmed time in IST, the doctor and the call link", async () => {
    await open({ "GET /orders/mine": { body: contractOrders }, "GET /consults/mine": { body: contractConsults } }, "consults");
    expect(await screen.findByText("12 Nov, 10:00 IST")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText(/Dr\. A\. Kapoor/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join the call" })).toHaveAttribute("href", "https://meet.example.com/ido-c8fk2");
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it("a customer with nothing yet sees the empty states, not errors", async () => {
    await open({ "GET /orders/mine": { body: [] }, "GET /consults/mine": { body: [] } }, "orders");
    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("Account when the API fails", () => {
  it("says it couldn't load the orders (not 'No orders yet') and retries on request", async () => {
    const { user, api } = await open(
      {
        "GET /orders/mine": [{ status: 500, body: {} }, { body: contractOrders }],
        "GET /consults/mine": { body: [] },
      },
      "orders",
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your orders");
    expect(screen.queryByText("No orders yet")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("IDO-7K3Q9M2X4P")).toBeInTheDocument();
    expect(api.count("GET /orders/mine")).toBe(2);
  });

  it("an older backend answering with raw rows shows the same calm error, not a crash", async () => {
    const raw = [{ id: "IDO-1", status: "placed", customer: { name: "A" }, createdAt: "2026-10-20T10:00:00Z" }];
    await open({ "GET /orders/mine": { body: raw }, "GET /consults/mine": { body: [] } }, "orders");
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your orders");
  });

  it("failing consults never hides the orders, and the overview shows a dash instead of a false 0", async () => {
    await open({ "GET /orders/mine": { body: contractOrders }, "GET /consults/mine": { status: 500, body: {} } });
    expect(await screen.findByText("Latest order")).toBeInTheDocument();
    expect(stat("Consults booked")).toHaveTextContent("—");
  });

  it("failing orders never hides the consults tab", async () => {
    await open({ "GET /orders/mine": { status: 500, body: {} }, "GET /consults/mine": { body: contractConsults } }, "consults");
    expect(await screen.findByText("12 Nov, 10:00 IST")).toBeInTheDocument();
  });

  it("an expired session offers 'Log in again', which logs out", async () => {
    const { user, api } = await open(
      {
        "GET /orders/mine": { status: 401, body: { message: "expired" } },
        "POST /auth/refresh": { status: 401, body: {} },
        "GET /consults/mine": { body: [] },
        "POST /auth/logout": { status: 204 },
      },
      "orders",
    );
    expect(await screen.findByText("Your session has expired")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Log in again" }));
    expect(api.count("POST /auth/logout")).toBe(1);
  });
});
