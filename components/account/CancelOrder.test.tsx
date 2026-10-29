import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { CancelOrder } from "@/components/account/CancelOrder";
import type { CancelPreview, Order } from "@/lib/orders-storage";
import { mockApi } from "@/tests/fetch-mock";
import { order, USER } from "@/tests/fixtures";

const PREVIEW = "GET /orders/IDO-ABC123/cancel-preview";
const CANCEL = "POST /orders/IDO-ABC123/cancel";

/** Prepaid after the kit was delivered: ₹14,999 paid − ₹1,000 kit = ₹13,999 back to Razorpay. */
const prepaidPreview: CancelPreview = {
  cancellable: true,
  refundPaise: 1399900,
  kitPricePaise: 100000,
  codFeePaise: 0,
  refundRoute: "razorpay",
};

/** COD after the kit was delivered: the kit price and the ₹100 fee both come off, paid by UPI/bank. */
const codPreview: CancelPreview = {
  cancellable: true,
  refundPaise: 1389900,
  kitPricePaise: 100000,
  codFeePaise: 10000,
  refundRoute: "bank_or_upi",
};

function setup(routes: Record<string, object>, over: Partial<Order> = {}) {
  const onOrderChange = vi.fn();
  const api = mockApi({ "GET /auth/me": { body: USER }, ...routes } as never);
  render(
    <AuthProvider>
      <CancelOrder order={order(over)} onOrderChange={onOrderChange} />
    </AuthProvider>,
  );
  return { api, onOrderChange, user: userEvent.setup() };
}

async function openForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Cancel order" }));
  await screen.findByRole("heading", { name: "Cancel this order" });
}

describe("CancelOrder: the refund preview comes from the server", () => {
  it("opening the form asks the server what a cancel would refund", async () => {
    const { user, api } = setup({ [PREVIEW]: { body: prepaidPreview } });
    await openForm(user);
    expect(api.count(PREVIEW)).toBe(1);
  });

  it("shows the server's breakdown, with the kit the customer keeps deducted", async () => {
    const { user } = setup({ [PREVIEW]: { body: prepaidPreview } });
    await openForm(user);
    expect(screen.getByText("You paid").parentElement).toHaveTextContent("₹14,999");
    expect(screen.getByText("Sizing kit (yours to keep)").parentElement).toHaveTextContent("−₹1,000");
    expect(screen.getByText("You get back").parentElement).toHaveTextContent("₹13,999");
  });

  it("shows the ₹100 COD fee as money that is not coming back", async () => {
    const { user } = setup({ [PREVIEW]: { body: codPreview } }, { paymentMethod: "cod" });
    await openForm(user);
    expect(screen.getByText("Cash on delivery fee (not refunded)").parentElement).toHaveTextContent("−₹100");
  });

  it("never asks for bank details on a prepaid refund", async () => {
    const { user } = setup({ [PREVIEW]: { body: prepaidPreview } });
    await openForm(user);
    expect(screen.queryByText("Where should we send your refund?")).not.toBeInTheDocument();
  });

  it("says the order can't be cancelled when the server says so, and offers support", async () => {
    const { user } = setup({ [PREVIEW]: { body: { ...prepaidPreview, cancellable: false } } });
    await openForm(user);
    expect(screen.getByText(/can't be cancelled any more/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeInTheDocument();
  });
});

describe("CancelOrder: prepaid", () => {
  it("nothing is sent until the customer gives a reason", async () => {
    const { user, api } = setup({ [PREVIEW]: { body: prepaidPreview } });
    await openForm(user);
    expect(screen.getByRole("button", { name: "Cancel this order" })).toBeDisabled();
    expect(api.count(CANCEL)).toBe(0);
  });

  it("posts the reason alone and hands the cancelled order up", async () => {
    const cancelled = order({ status: "cancelled", cancelReason: "customer" });
    const { user, api, onOrderChange } = setup({
      [PREVIEW]: { body: prepaidPreview },
      [CANCEL]: { body: { outcome: "cancelled", order: cancelled } },
    });
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Changed my mind");
    await user.click(screen.getByRole("button", { name: "Cancel this order" }));
    await waitFor(() => expect(onOrderChange).toHaveBeenCalledWith(cancelled));
    expect(api.calls.find((c) => c.path.endsWith("/cancel"))?.body).toEqual({ reason: "Changed my mind" });
    expect(screen.getByText("Your order is cancelled")).toBeInTheDocument();
  });

  it("'Keep my order' closes the form without sending anything", async () => {
    const { user, api } = setup({ [PREVIEW]: { body: prepaidPreview } });
    await openForm(user);
    await user.click(screen.getByRole("button", { name: "Keep my order" }));
    expect(screen.getByRole("button", { name: "Cancel order" })).toBeInTheDocument();
    expect(api.count(CANCEL)).toBe(0);
  });
});

describe("CancelOrder: COD needs UPI or bank details behind a step-up OTP", () => {
  const codRoutes = {
    [PREVIEW]: { body: codPreview },
    "POST /auth/phone/send-otp": { body: {} },
    "POST /auth/step-up": { body: {} },
  };

  it("asks for a code before the details may be sent at all", async () => {
    const { user, api } = setup(codRoutes, { paymentMethod: "cod" });
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Bought one elsewhere");
    await user.type(screen.getByLabelText("UPI ID"), "kavya.example@okx");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    expect(await screen.findByLabelText("Enter the code we sent you")).toBeInTheDocument();
    expect(api.count("POST /auth/phone/send-otp")).toBe(1);
    expect(api.count(CANCEL)).toBe(0);
  });

  it("rejects an obviously wrong UPI ID in the browser, without a round trip", async () => {
    const { user, api } = setup(codRoutes, { paymentMethod: "cod" });
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "No longer needed");
    await user.type(screen.getByLabelText("UPI ID"), "not-a-upi-id");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That UPI ID doesn't look right");
    expect(api.count("POST /auth/phone/send-otp")).toBe(0);
  });

  it("rejects a malformed IFSC before sending", async () => {
    const { user, api } = setup(codRoutes, { paymentMethod: "cod" });
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "No longer needed");
    await user.click(screen.getByRole("radio", { name: "Bank account" }));
    await user.type(screen.getByLabelText("Name on the account"), "Rohan Mehta");
    await user.type(screen.getByLabelText("Account number"), "000011112222");
    await user.type(screen.getByLabelText("IFSC code"), "HDFC1");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("IFSC code doesn't look right");
    expect(api.count("POST /auth/phone/send-otp")).toBe(0);
  });

  it("steps up first, then cancels with the destination — in that order", async () => {
    const cancelled = order({ status: "cancelled", cancelReason: "customer", paymentMethod: "cod" });
    const { user, api, onOrderChange } = setup(
      { ...codRoutes, [CANCEL]: { body: { outcome: "cancelled", order: cancelled } } },
      { paymentMethod: "cod" },
    );
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Bought one elsewhere");
    await user.type(screen.getByLabelText("UPI ID"), "kavya.example@okx");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    await user.type(await screen.findByLabelText("Enter the code we sent you"), "123456");
    await user.click(screen.getByRole("button", { name: "Cancel this order" }));

    await waitFor(() => expect(onOrderChange).toHaveBeenCalledWith(cancelled));
    const seq = api.calls.map((c) => `${c.method} ${c.path}`);
    expect(seq.indexOf("POST /auth/step-up")).toBeGreaterThan(-1);
    expect(seq.indexOf("POST /auth/step-up")).toBeLessThan(seq.indexOf(`POST /orders/IDO-ABC123/cancel`));
    expect(api.calls.find((c) => c.path.endsWith("/cancel"))?.body).toEqual({
      reason: "Bought one elsewhere",
      destination: { type: "upi", upiId: "kavya.example@okx" },
    });
  });

  it("sends bank details in the contract's shape, with the IFSC upper-cased", async () => {
    const cancelled = order({ status: "cancelled", cancelReason: "customer", paymentMethod: "cod" });
    const { user, api } = setup(
      { ...codRoutes, [CANCEL]: { body: { outcome: "cancelled", order: cancelled } } },
      { paymentMethod: "cod" },
    );
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Changed my mind");
    await user.click(screen.getByRole("radio", { name: "Bank account" }));
    await user.type(screen.getByLabelText("Name on the account"), "Rohan Mehta");
    await user.type(screen.getByLabelText("Account number"), "000011112222");
    await user.type(screen.getByLabelText("IFSC code"), "hdfc0000001");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    await user.type(await screen.findByLabelText("Enter the code we sent you"), "123456");
    await user.click(screen.getByRole("button", { name: "Cancel this order" }));

    await waitFor(() => expect(api.count(CANCEL)).toBe(1));
    expect(api.calls.find((c) => c.path.endsWith("/cancel"))?.body).toEqual({
      reason: "Changed my mind",
      destination: { type: "bank", accountNo: "000011112222", ifsc: "HDFC0000001", holder: "Rohan Mehta" },
    });
  });

  it("tells the customer their details are encrypted and deleted after the refund", async () => {
    const { user } = setup(codRoutes, { paymentMethod: "cod" });
    await openForm(user);
    expect(screen.getByText(/encrypt these details.*delete them 90 days/)).toBeInTheDocument();
  });

  it("on 401 STEP_UP_REQUIRED sends a fresh code instead of losing the form", async () => {
    const { user, api } = setup(
      {
        ...codRoutes,
        [CANCEL]: { status: 401, body: { message: "Please confirm with the OTP we just sent.", code: "STEP_UP_REQUIRED" } },
      },
      { paymentMethod: "cod" },
    );
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Bought one elsewhere");
    await user.type(screen.getByLabelText("UPI ID"), "kavya.example@okx");
    await user.click(screen.getByRole("button", { name: "Send me a code" }));
    await user.type(await screen.findByLabelText("Enter the code we sent you"), "123456");
    await user.click(screen.getByRole("button", { name: "Cancel this order" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That code has expired");
    await waitFor(() => expect(api.count("POST /auth/phone/send-otp")).toBe(2));
    expect(screen.getByLabelText("Enter the code we sent you")).toBeInTheDocument();
  });
});

describe("CancelOrder: the kit is still in transit", () => {
  it("explains that cancelling only asks the courier to bring the kit back", async () => {
    const { user } = setup(
      { [PREVIEW]: { body: { ...prepaidPreview, refundRoute: "rto_first" as const } } },
      { status: "kit_shipped" },
    );
    await openForm(user);
    expect(screen.getByText(/ask the courier to bring it back/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel and return the kit" })).toBeInTheDocument();
  });

  it("an rto_requested outcome says the order stays open until the kit is back", async () => {
    const stillShipped = order({ status: "kit_shipped" });
    const { user } = setup(
      {
        [PREVIEW]: { body: { ...prepaidPreview, refundRoute: "rto_first" as const } },
        [CANCEL]: { body: { outcome: "rto_requested", order: stillShipped } },
      },
      { status: "kit_shipped" },
    );
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Changed my mind");
    await user.click(screen.getByRole("button", { name: "Cancel and return the kit" }));
    expect(await screen.findByText("We're bringing your kit back")).toBeInTheDocument();
    expect(screen.getByText(/stays open until it reaches us/)).toBeInTheDocument();
  });
});

describe("CancelOrder: the ring shipped while the form was open", () => {
  it("on 409 NOT_CANCELLABLE shows the server's message and re-reads the order", async () => {
    const shipped = order({ status: "ring_shipped" });
    const { user, api, onOrderChange } = setup({
      [PREVIEW]: { body: prepaidPreview },
      [CANCEL]: {
        status: 409,
        body: { message: "Your ring has already shipped, so this order can't be cancelled.", code: "NOT_CANCELLABLE" },
      },
      "GET /orders/IDO-ABC123": { body: shipped },
    });
    await openForm(user);
    await user.type(screen.getByLabelText("Why are you cancelling?"), "Changed my mind");
    await user.click(screen.getByRole("button", { name: "Cancel this order" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your ring has already shipped");
    await waitFor(() => expect(onOrderChange).toHaveBeenCalledWith(shipped));
    expect(api.count("GET /orders/IDO-ABC123")).toBe(1);
  });
});
