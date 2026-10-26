import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "@/lib/auth-context";
import { AccountClient } from "@/components/account/AccountClient";
import { mockApi } from "@/tests/fetch-mock";
import { USER } from "@/tests/fixtures";

vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => null }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));

describe("AccountClient: the login gate", () => {
  it("shows 'Loading…' while it finds out who you are, then the dashboard for a logged-in customer", async () => {
    mockApi({ "GET /auth/me": { body: USER }, "GET /orders/mine": { body: [] }, "GET /consults/mine": { body: [] } });
    render(<AuthProvider><AccountClient /></AuthProvider>);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(await screen.findByText("Your account")).toBeInTheDocument();
  });

  it("shows the login form (phone first) to a visitor with no session", async () => {
    mockApi({ "GET /auth/me": { status: 401, body: {} }, "POST /auth/refresh": { status: 401, body: {} } });
    render(<AuthProvider><AccountClient /></AuthProvider>);
    expect(await screen.findByText("Log in or sign up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("10-digit mobile")).toBeInTheDocument();
  });
});
