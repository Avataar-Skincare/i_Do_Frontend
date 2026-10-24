import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/lib/auth-context";
import { AuthForm } from "@/components/account/AuthForm";
import { mockApi } from "@/tests/fetch-mock";
import { USER } from "@/tests/fixtures";

const loggedOut = { "GET /auth/me": { status: 401, body: {} }, "POST /auth/refresh": { status: 401, body: {} } };

function setup(routes: Record<string, never | object>, onSuccess = vi.fn()) {
  const api = mockApi({ ...loggedOut, ...routes } as never);
  render(<AuthProvider><AuthForm onSuccess={onSuccess} /></AuthProvider>);
  return { api, onSuccess, user: userEvent.setup() };
}

describe("AuthForm: phone is the default, email the alternative", () => {
  it("opens on phone number", () => {
    setup({});
    expect(screen.getByPlaceholderText("10-digit mobile")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("you@email.com")).not.toBeInTheDocument();
    expect(screen.getByText(/text you a one-time code/i)).toBeInTheDocument();
  });

  it("switches to email and back, clearing what was typed", async () => {
    const { user } = setup({});
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await user.click(screen.getByText("Continue with email instead"));
    expect(screen.getByPlaceholderText("you@email.com")).toHaveValue("");
    await user.click(screen.getByText("Continue with phone number instead"));
    expect(screen.getByPlaceholderText("10-digit mobile")).toHaveValue("");
  });

  it("only accepts digits, at most 10, in the phone box", async () => {
    const { user } = setup({});
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "98a76-543210999");
    expect(screen.getByPlaceholderText("10-digit mobile")).toHaveValue("9876543210");
  });

  it("rejects a short phone number without calling the API", async () => {
    const { user, api } = setup({});
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "98765");
    await user.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid 10-digit phone number")).toBeInTheDocument();
    expect(api.count("POST /auth/phone/send-otp")).toBe(0);
  });
});

describe("AuthForm: phone login end to end", () => {
  it("sends the code, verifies it, and reports success", async () => {
    const { user, api, onSuccess } = setup({
      "POST /auth/phone/send-otp": { body: { message: "sent" } },
      "POST /auth/phone/verify-otp": { body: { user: USER } },
    });
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await user.type(screen.getByPlaceholderText("Your name"), "Asha Rao");
    await user.click(screen.getByText("Send code"));

    expect(await screen.findByText(/Enter the 6-digit code we sent to 9876543210/)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("123456"), "123456");
    await user.click(screen.getByText("Verify & continue"));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    const verify = api.calls.find((c) => c.path === "/auth/phone/verify-otp")!;
    expect(verify.body).toEqual({ phone: "9876543210", code: "123456", fullName: "Asha Rao" });
  });

  it("shows the server's message for a wrong code and stays on the code step", async () => {
    const { user, onSuccess } = setup({
      "POST /auth/phone/send-otp": { body: {} },
      "POST /auth/phone/verify-otp": { status: 401, body: { message: "That code is invalid or has expired" } },
    });
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await user.click(screen.getByText("Send code"));
    await user.type(await screen.findByPlaceholderText("123456"), "000000");
    await user.click(screen.getByText("Verify & continue"));
    expect(await screen.findByText("That code is invalid or has expired")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("insists on a 6-digit code before calling verify", async () => {
    const { user, api } = setup({ "POST /auth/phone/send-otp": { body: {} } });
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await user.click(screen.getByText("Send code"));
    await user.type(await screen.findByPlaceholderText("123456"), "123");
    await user.click(screen.getByText("Verify & continue"));
    expect(screen.getByText("Enter the 6-digit code")).toBeInTheDocument();
    expect(api.count("POST /auth/phone/verify-otp")).toBe(0);
  });

  it("resend asks for a new code and says so; 'Change number' goes back", async () => {
    const { user, api } = setup({ "POST /auth/phone/send-otp": { body: {} } });
    await user.type(screen.getByPlaceholderText("10-digit mobile"), "9876543210");
    await user.click(screen.getByText("Send code"));
    await user.click(await screen.findByText("Resend code"));
    expect(await screen.findByText("A new code was sent.")).toBeInTheDocument();
    expect(api.count("POST /auth/phone/send-otp")).toBe(2);
    await user.click(screen.getByText("Change number"));
    expect(screen.getByPlaceholderText("10-digit mobile")).toHaveValue("9876543210");
  });
});

describe("AuthForm: email login end to end", () => {
  it("uses the email routes and lower-level validation", async () => {
    const { user, api, onSuccess } = setup({
      "POST /auth/email/send-otp": { body: {} },
      "POST /auth/email/verify-otp": { body: { user: USER } },
    });
    await user.click(screen.getByText("Continue with email instead"));
    await user.type(screen.getByPlaceholderText("you@email.com"), "asha@x"); // passes the browser's own check, fails ours (no dot)
    await user.click(screen.getByText("Send code"));
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("you@email.com"));
    await user.type(screen.getByPlaceholderText("you@email.com"), "asha@x.in");
    await user.click(screen.getByText("Send code"));
    await user.type(await screen.findByPlaceholderText("123456"), "654321");
    await user.click(screen.getByText("Verify & continue"));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(api.calls.find((c) => c.path === "/auth/email/verify-otp")!.body).toEqual({
      email: "asha@x.in", code: "654321", fullName: undefined,
    });
  });

  it("surfaces the rate-limit message from a 429", async () => {
    const { user } = setup({
      "POST /auth/email/send-otp": { status: 429, body: { message: "Please wait 30 seconds", code: "OTP_RATE_LIMIT" } },
    });
    await user.click(screen.getByText("Continue with email instead"));
    await user.type(screen.getByPlaceholderText("you@email.com"), "asha@x.in");
    await user.click(screen.getByText("Send code"));
    expect(await screen.findByText("Please wait 30 seconds")).toBeInTheDocument();
  });
});
