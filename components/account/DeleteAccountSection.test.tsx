import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { DeleteAccountSection } from "@/components/account/DeleteAccountSection";
import { mockApi } from "@/tests/fetch-mock";
import { USER } from "@/tests/fixtures";

function setup(routes: Record<string, object>) {
  const api = mockApi({ "GET /auth/me": { body: USER }, ...routes } as never);
  render(<AuthProvider><DeleteAccountSection /></AuthProvider>);
  return { api, user: userEvent.setup() };
}

describe("DeleteAccountSection: two-step, in-place confirmation", () => {
  it("nothing is sent until the second, explicit confirmation", async () => {
    const { user, api } = setup({ "DELETE /auth/me": { body: {} } });
    await user.click(screen.getByText("Delete my account"));
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    expect(api.count("DELETE /auth/me")).toBe(0);
  });

  it("'Never mind' backs out without calling the API", async () => {
    const { user, api } = setup({});
    await user.click(screen.getByText("Delete my account"));
    await user.click(screen.getByText("Never mind"));
    expect(screen.getByText("Delete my account")).toBeInTheDocument();
    expect(api.count("DELETE /auth/me")).toBe(0);
  });

  it("confirming deletes the account, with the CSRF header", async () => {
    const { user, api } = setup({ "DELETE /auth/me": { body: {} } });
    await user.click(screen.getByText("Delete my account"));
    await user.click(screen.getByText("Yes, delete my account"));
    // On success the page is replaced by the login form (AccountClient), so here the button just stays busy.
    expect(await screen.findByRole("button", { name: "Deleting…" })).toBeDisabled();
    const call = api.calls.find((c) => c.method === "DELETE")!;
    expect(call.path).toBe("/auth/me");
    expect(call.headers["X-Requested-With"]).toBe("ido");
  });

  it("a server refusal is shown in place and the button comes back", async () => {
    const { user } = setup({
      "DELETE /auth/me": { status: 409, body: { message: "You still have an open order", code: "ACCOUNT_HAS_OPEN_ORDER" } },
    });
    await user.click(screen.getByText("Delete my account"));
    await user.click(screen.getByText("Yes, delete my account"));
    expect(await screen.findByText("You still have an open order")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, delete my account" })).toBeEnabled();
  });
});
