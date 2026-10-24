import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { mockApi, type Call } from "@/tests/fetch-mock";
import { USER, RING_LINE, order } from "@/tests/fixtures";

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: nav.push }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("@/lib/use-catalog", () => ({ useCatalog: () => null }));

const rzp = vi.hoisted(() => ({ pay: vi.fn() }));
vi.mock("@/lib/razorpay", async (orig) => ({ ...(await orig<typeof import("@/lib/razorpay")>()), payWithRazorpay: rzp.pay }));
import { PaymentNotCompletedError } from "@/lib/razorpay";

const RAZORPAY = { id: "order_RZ1", amount: 1499900, currency: "INR", keyId: "rzp_test_x" };
const PROOF = { razorpayOrderId: "order_RZ1", razorpayPaymentId: "pay_1", razorpaySignature: "sig" };
const loggedIn = { "GET /auth/me": { body: USER } };
const loggedOut = { "GET /auth/me": { status: 401, body: {} }, "POST /auth/refresh": { status: 401, body: {} } };
const quote = (over = {}) => ({ body: { subtotal: 1499900, codFee: 0, discount: 0, total: 1499900, codAvailable: true, ...over } });

function renderCheckout(routes: Record<string, object>) {
  localStorage.setItem("ido_cart", JSON.stringify([RING_LINE]));
  const api = mockApi({ "POST /orders/quote": quote(), ...routes } as never);
  render(<AuthProvider><CartProvider><CheckoutForm /></CartProvider></AuthProvider>);
  return { api, user: userEvent.setup() };
}

type U = ReturnType<typeof userEvent.setup>;
async function fill(user: U, over: Record<string, string> = {}) {
  const v = { address: "1 MG Road", city: "Pune", state: "Maharashtra", pin: "411001", ...over };
  await user.type(screen.getByPlaceholderText("House / flat, street, area"), v.address);
  await user.type(screen.getByPlaceholderText("City"), v.city);
  await user.type(screen.getByPlaceholderText("State"), v.state);
  await user.type(screen.getByPlaceholderText("6-digit"), v.pin);
}
const placeBtn = () => screen.getByRole("button", { name: /Place order|Try payment again/ });
const ordersPosts = (api: { calls: Call[] }) => api.calls.filter((c) => c.method === "POST" && c.path === "/orders");

beforeEach(() => {
  nav.push.mockReset();
  rzp.pay.mockReset();
});

describe("checkout: validation and login gate", () => {
  it("shows every field error and sends nothing when the form is empty", async () => {
    const { user, api } = renderCheckout({ ...loggedIn });
    await screen.findByDisplayValue("Asha Rao");
    await user.clear(screen.getByPlaceholderText("Your name"));
    await user.click(placeBtn());
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByText("Enter your address")).toBeInTheDocument();
    expect(screen.getByText("Enter a 6-digit PIN code")).toBeInTheDocument();
    expect(ordersPosts(api)).toHaveLength(0);
  });

  it("asks a logged-out customer to log in first, and places nothing yet", async () => {
    const { user, api } = renderCheckout({ ...loggedOut });
    await user.type(await screen.findByPlaceholderText("Your name"), "Asha Rao");
    await user.type(screen.getByPlaceholderText("you@email.com"), "asha@x.in");
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await fill(user);
    await user.click(placeBtn());
    expect(await screen.findByText(/Log in or create an account to place this order/)).toBeInTheDocument();
    expect(ordersPosts(api)).toHaveLength(0);
  });

  it("prefills name, email and phone from the account", async () => {
    renderCheckout({ ...loggedIn });
    expect(await screen.findByDisplayValue("Asha Rao")).toBeInTheDocument();
    expect(screen.getByDisplayValue("asha@x.in")).toBeInTheDocument();
    expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
  });

  it("requires a valid GSTIN and business name only when a GST invoice is asked for", async () => {
    const { user, api } = renderCheckout({ ...loggedIn });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(screen.getByLabelText(/I need a GST invoice/));
    await user.type(screen.getByPlaceholderText("15-character GSTIN"), "BADGSTIN");
    await user.click(placeBtn());
    expect(screen.getByText("Enter a valid 15-character GSTIN")).toBeInTheDocument();
    expect(screen.getByText("Enter your business name")).toBeInTheDocument();
    expect(ordersPosts(api)).toHaveLength(0);
  });
});

describe("checkout: online payment", () => {
  const routes = () => ({
    ...loggedIn,
    "POST /orders": { status: 201, body: { order: order({ id: "IDO-1", status: "pending_payment" }), razorpay: RAZORPAY } },
    "POST /orders/IDO-1/payment/verify": { body: order({ id: "IDO-1", status: "confirmed" }) },
  });

  it("creates the order (key, no prices), pays in Razorpay, verifies, clears the bag and goes to /confirm", async () => {
    rzp.pay.mockResolvedValue(PROOF);
    const { user, api } = renderCheckout(routes());
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/confirm?orderId=IDO-1"));
    const create = ordersPosts(api)[0];
    expect(create.headers["Idempotency-Key"]).toMatch(/[0-9a-f-]{36}/);
    expect(create.body as object).toMatchObject({ finish: "gold", paymentMethod: "online", address: { pin: "411001" } });
    expect(JSON.stringify(create.body)).not.toMatch(/price|amount|total/i);
    expect(rzp.pay).toHaveBeenCalledWith(RAZORPAY, { name: "Asha Rao", email: "asha@x.in", phone: "9876543210" });
    expect(api.calls.find((c) => c.path === "/orders/IDO-1/payment/verify")!.body).toEqual(PROOF);
    expect(localStorage.getItem("ido_cart")).toBe("[]");
  });

  it("closing the Razorpay window shows 'Payment not completed. Try again.', keeps the bag, offers 'Try payment again'", async () => {
    rzp.pay.mockRejectedValue(new PaymentNotCompletedError());
    const { user } = renderCheckout(routes());
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("Payment not completed. Try again.");
    expect(screen.getByRole("button", { name: "Try payment again" })).toBeEnabled();
    expect(nav.push).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("ido_cart")!)).toHaveLength(1);
  });

  it("'Try payment again' reuses the Idempotency-Key; changing any detail makes a NEW key", async () => {
    rzp.pay.mockRejectedValue(new PaymentNotCompletedError());
    const { user, api } = renderCheckout(routes());
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());
    await screen.findByRole("button", { name: "Try payment again" });
    await user.click(screen.getByRole("button", { name: "Try payment again" }));
    await waitFor(() => expect(ordersPosts(api)).toHaveLength(2));

    await screen.findByRole("button", { name: "Try payment again" });
    await user.type(screen.getByPlaceholderText("House / flat, street, area"), " Flat 4");
    await user.click(screen.getByRole("button", { name: "Try payment again" }));
    await waitFor(() => expect(ordersPosts(api)).toHaveLength(3));

    const keys = ordersPosts(api).map((c) => c.headers["Idempotency-Key"]);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  it("a verify call that fails for a network reason still goes to /confirm (the webhook is the source of truth)", async () => {
    rzp.pay.mockResolvedValue(PROOF);
    const { user } = renderCheckout({ ...routes(), "POST /orders/IDO-1/payment/verify": { status: 500, body: {} } });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/confirm?orderId=IDO-1"));
  });

  it("a SIGNATURE_INVALID verify is a real failure: stay on the page, show the error, keep the bag", async () => {
    rzp.pay.mockResolvedValue(PROOF);
    const { user } = renderCheckout({
      ...routes(),
      "POST /orders/IDO-1/payment/verify": { status: 400, body: { message: "Payment could not be verified", code: "SIGNATURE_INVALID" } },
    });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("Payment could not be verified");
    expect(nav.push).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("ido_cart")!)).toHaveLength(1);
  });
});

describe("checkout: cash on delivery", () => {
  it("places a COD order without opening Razorpay or verifying", async () => {
    const { user, api } = renderCheckout({
      ...loggedIn,
      "POST /orders/quote": quote({ codFee: 10000, total: 1509900 }),
      "POST /orders": { status: 201, body: { order: order({ id: "IDO-2", status: "cod_pending", paymentMethod: "cod" }) } },
    });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(screen.getByText("Cash on Delivery"));
    await screen.findByText("₹15,099", { selector: "span.text-\\[1\\.7rem\\]" });
    await user.click(placeBtn());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/confirm?orderId=IDO-2"));
    expect(rzp.pay).not.toHaveBeenCalled();
    expect(api.calls.some((c) => c.path.endsWith("/payment/verify"))).toBe(false);
    expect((ordersPosts(api)[0].body as { paymentMethod: string }).paymentMethod).toBe("cod");
  });

  it("blocks COD for a PIN that isn't serviceable and says why", async () => {
    const { user, api } = renderCheckout({
      ...loggedIn,
      "POST /orders/quote": quote({ codAvailable: false, codReason: "pincode_not_serviceable" }),
    });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(screen.getByText("Cash on Delivery"));
    expect(await screen.findByText(/isn't available for this pincode/)).toBeInTheDocument();
    expect(placeBtn()).toBeDisabled();
    expect(ordersPosts(api)).toHaveLength(0);
  });
});

describe("checkout: server errors", () => {
  it("STORE_NOT_LIVE shows the server's message and keeps the form", async () => {
    const { user } = renderCheckout({
      ...loggedIn,
      "POST /orders": { status: 503, body: { message: "The store isn't open yet", code: "STORE_NOT_LIVE" } },
    });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(placeBtn());
    expect(await screen.findByRole("alert")).toHaveTextContent("The store isn't open yet");
    expect(nav.push).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("City")).toHaveValue("Pune");
  });

  it("GSTIN_INVALID from the server is shown on the GST field", async () => {
    const { user } = renderCheckout({
      ...loggedIn,
      "POST /orders": { status: 400, body: { message: "GSTIN doesn't match", code: "GSTIN_INVALID" } },
    });
    await screen.findByDisplayValue("Asha Rao");
    await fill(user);
    await user.click(screen.getByLabelText(/I need a GST invoice/));
    await user.type(screen.getByPlaceholderText("15-character GSTIN"), "27AAPFU0939F1ZV");
    await user.type(screen.getByPlaceholderText("Registered business name"), "Acme LLP");
    await user.click(placeBtn());
    expect((await screen.findAllByText("GSTIN doesn't match")).length).toBeGreaterThan(0);
  });

  it("an empty bag shows 'Your bag is empty' instead of the form", () => {
    mockApi({ ...loggedIn });
    render(<AuthProvider><CartProvider><CheckoutForm /></CartProvider></AuthProvider>);
    expect(screen.getByText("Your bag is empty")).toBeInTheDocument();
  });
});
