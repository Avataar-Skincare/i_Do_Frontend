import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SizeSubmit } from "@/components/account/SizeSubmit";
import { mockApi } from "@/tests/fetch-mock";
import { order } from "@/tests/fixtures";

const catalog = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => catalog.value }));

function setup(routes: Record<string, object>, over = {}) {
  const onSubmitted = vi.fn();
  const api = mockApi(routes as never);
  render(<SizeSubmit order={order(over)} onSubmitted={onSubmitted} />);
  return { api, onSubmitted, user: userEvent.setup() };
}

describe("SizeSubmit: size confirmation step", () => {
  it("cannot submit until a size is chosen", () => {
    catalog.value = null;
    setup({});
    expect(screen.getByRole("button", { name: "Choose a size" })).toBeDisabled();
  });

  it("asks 'You're choosing US N. This can't be changed later. Confirm?' before anything is sent", async () => {
    const { user, api } = setup({});
    await user.click(screen.getByRole("radio", { name: "US 9" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 9" }));
    expect(screen.getByText("You're choosing US 9. This can't be changed later. Confirm?")).toBeInTheDocument();
    expect(api.calls).toHaveLength(0);
  });

  it("'Go back' returns to the picker without sending", async () => {
    const { user, api } = setup({});
    await user.click(screen.getByRole("radio", { name: "US 7" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 7" }));
    await user.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByRole("button", { name: "Submit size US 7" })).toBeInTheDocument();
    expect(api.calls).toHaveLength(0);
  });

  it("confirming posts {usSize, confirmed:true} and hands the updated order up", async () => {
    const updated = order({ status: "size_submitted", usSize: 9 });
    const { user, api, onSubmitted } = setup({ "POST /orders/IDO-ABC123/size": { body: updated } });
    await user.click(screen.getByRole("radio", { name: "US 9" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 9" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 9" }));
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(updated));
    expect(api.calls[0].body).toEqual({ usSize: 9, confirmed: true });
  });

  it("on 409 SIZE_LOCKED shows the message and re-reads the order instead of the form", async () => {
    const locked = order({ status: "size_submitted", usSize: 8 });
    const { user, api, onSubmitted } = setup({
      "POST /orders/IDO-ABC123/size": { status: 409, body: { message: "Your size is already locked", code: "SIZE_LOCKED" } },
      "GET /orders/IDO-ABC123": { body: locked },
    });
    await user.click(screen.getByRole("radio", { name: "US 10" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 10" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 10" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your size is already locked");
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(locked));
    expect(api.count("GET /orders/IDO-ABC123")).toBe(1);
  });

  it("on a network error keeps the form usable and says what to do", async () => {
    const { user } = setup({ "POST /orders/IDO-ABC123/size": { status: 500, body: {} } });
    await user.click(screen.getByRole("radio", { name: "US 6" }));
    await user.click(screen.getByRole("button", { name: "Submit size US 6" }));
    await user.click(screen.getByRole("button", { name: "Confirm US 6" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit size US 6" })).toBeEnabled();
  });
});

describe("SizeSubmit: target date and stock", () => {
  it("shows the target date as a reminder, not a deadline", () => {
    const due = new Date(Date.now() + 3 * 86_400_000 + 3_600_000).toISOString();
    setup({}, { sizeDueAt: due });
    expect(screen.getByText("Target date")).toBeInTheDocument();
    expect(screen.getByText("4 days left")).toBeInTheDocument();
    expect(screen.getByText(/target, not a deadline/)).toBeInTheDocument();
  });

  it("past the date, says so and still lets the customer submit", () => {
    setup({}, { sizeDueAt: new Date(Date.now() - 86_400_000).toISOString() });
    expect(screen.getByText("Past the target date")).toBeInTheDocument();
    expect(screen.getByText(/You can still submit your size/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "US 9" })).toBeEnabled();
  });

  it("marks sizes the catalog says are out of stock as 'ships later' for this order's finish only", () => {
    catalog.value = {
      finishes: [
        { id: "gold", name: "Gold", sizes: [{ us: 9, inStock: false }, { us: 8, inStock: true }] },
        { id: "silver", name: "Silver", sizes: [{ us: 7, inStock: false }] },
      ],
    };
    setup({});
    expect(screen.getByRole("radio", { name: /US 9/ })).toHaveTextContent("ships later");
    expect(screen.getByRole("radio", { name: /US 8/ })).not.toHaveTextContent("ships later");
    expect(screen.getByRole("radio", { name: /US 7/ })).not.toHaveTextContent("ships later");
    catalog.value = null;
  });
});
