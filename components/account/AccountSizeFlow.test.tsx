import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { mockApi } from "@/tests/fetch-mock";
import { USER } from "@/tests/fixtures";
import type { Order } from "@/lib/orders-storage";
import contractOrders from "@/tests/contract/orders-mine.json";

/**
 * The whole size journey through the real dashboard, cards and size form (network mocked from the contract's
 * own example orders): kit delivered → choose → confirm → locked, and the card, strip and tracking all follow.
 */
const nav = vi.hoisted(() => ({ tab: "orders" as string | null }));
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => nav.tab }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));

const kit = contractOrders[0] as unknown as Order; // kit_delivered, gold
const locked = (usSize: number): Order => ({
  ...kit,
  status: "size_submitted",
  usSize,
  sizeSubmittedAt: "2026-10-27T11:00:00+05:30",
});

async function open(routes: Record<string, object>, tab = "orders") {
  nav.tab = tab;
  const api = mockApi({
    "GET /auth/me": { body: USER },
    "GET /orders/mine": { body: [kit] },
    "GET /consults/mine": { body: [] },
    ...routes,
  } as never);
  render(<AuthProvider><AccountDashboard /></AuthProvider>);
  await screen.findByText("Submit your ring size");
  return { api, user: userEvent.setup() };
}
const currentStep = () => screen.getAllByRole("listitem").find((li) => li.getAttribute("aria-current") === "step")?.textContent;

describe("size journey through the account", () => {
  it("kit delivered → pick US 9 → confirm → locked: the card, the strip and the form all follow", async () => {
    const { user, api } = await open({ [`POST /orders/${kit.id}/size`]: { body: locked(9) } });
    expect(currentStep()).toBe("Kit delivered");

    await user.click(screen.getByRole("radio", { name: "US 9" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 9" }));
    expect(screen.getByText("You're choosing US 9. This can't be changed later. Confirm?")).toBeInTheDocument();
    expect(api.calls.some((c) => c.path.endsWith("/size"))).toBe(false); // nothing sent before the confirmation
    await user.click(screen.getByRole("button", { name: "Confirm US 9" }));

    expect(await screen.findByText(/Size US 9 is locked\. Your ring ships next\./)).toBeInTheDocument();
    expect(screen.queryByText("Submit your ring size")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(currentStep()).toBe("Size submitted");
    expect(screen.getByText("Size US 9", { exact: false })).toBeInTheDocument();
    expect(api.calls.find((c) => c.path.endsWith("/size"))!.body).toEqual({ usSize: 9, confirmed: true });
    expect(api.count("GET /orders/mine")).toBe(1); // updated in place, no refetch of the whole list
  });

  it("the Track tab shows the locked size's stage with its date", async () => {
    const { user } = await open({ [`POST /orders/${kit.id}/size`]: { body: locked(8) } });
    await user.click(screen.getByRole("radio", { name: "US 8" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 8" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 8" }));
    await screen.findByText(/Size US 8 is locked/);
    await user.click(screen.getByRole("button", { name: /Track/ }));
    const stage = await screen.findByRole("heading", { name: /Size submitted/ });
    expect(stage).toHaveTextContent("27 Oct");
  });

  it("someone else locked it first (409 SIZE_LOCKED): shows the server's message, then the order as it really is", async () => {
    const { user, api } = await open({
      [`POST /orders/${kit.id}/size`]: { status: 409, body: { message: "Your size is already locked. Contact support if something is wrong.", code: "SIZE_LOCKED" } },
      [`GET /orders/${kit.id}`]: { body: locked(10) },
    });
    await user.click(screen.getByRole("radio", { name: "US 7" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 7" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 7" }));
    await waitFor(() => expect(screen.getByText(/Size US 10 is locked/)).toBeInTheDocument()); // the real locked size, not the one tried
    expect(api.count(`GET /orders/${kit.id}`)).toBe(1);
    expect(currentStep()).toBe("Size submitted");
  });

  it("a network failure keeps the form so the customer can try again", async () => {
    const { user } = await open({ [`POST /orders/${kit.id}/size`]: { status: 500, body: {} } });
    await user.click(screen.getByRole("radio", { name: "US 11" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 11" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 11" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(within(screen.getByRole("radiogroup")).getByRole("radio", { name: "US 11" })).toBeChecked();
    expect(currentStep()).toBe("Kit delivered");
  });
});
