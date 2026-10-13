"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { apiPost, ApiError } from "@/lib/api";

type Method = "email" | "phone";
type Tab = "login" | "signup" | "forgot" | "verify";
type PhoneStep = "enter" | "code";

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

export function AuthForm() {
  const {
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    pendingVerificationEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();

  const [method, setMethod] = useState<Method>("email");

  // Email + password (login/signup/forgot/verify)
  const [tab, setTab] = useState<Tab>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [verifyCode, setVerifyCode] = useState("");
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Phone OTP (passwordless — one flow covers both signup and login)
  const [phone, setPhone] = useState("");
  const [phoneFullName, setPhoneFullName] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneCodeResent, setPhoneCodeResent] = useState(false);

  function switchMethod(next: Method) {
    setMethod(next);
    setTab("login");
    setErrors({});
    setSubmitError(null);
    setPhoneStep("enter");
    setPhoneError(null);
    setPhoneCodeResent(false);
  }

  function switchTab(next: Tab) {
    setTab(next);
    setErrors({});
    setSubmitError(null);
    setForgotError(null);
    setForgotSent(false);
  }

  function validate() {
    const found: typeof errors = {};
    if (tab === "signup" && !fullName.trim()) found.fullName = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email)) found.email = "Enter a valid email";
    if (tab === "signup" && password.length < 8) found.password = "At least 8 characters";
    else if (!password) found.password = "Enter your password";
    return found;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, fullName.trim());
        setTab("verify");
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(verifyCode)) {
      setVerifyError("Enter the 6-digit code");
      return;
    }
    setVerifySubmitting(true);
    setVerifyError(null);
    try {
      await verifyEmail(verifyCode);
    } catch (err) {
      setVerifyError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setVerifySubmitting(false);
    }
  }

  async function handleResend() {
    setResendSubmitting(true);
    setVerifyError(null);
    try {
      await resendVerificationEmail();
      setResendSent(true);
    } catch (err) {
      setVerifyError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setResendSubmitting(false);
    }
  }

  async function handleForgotSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      setForgotError("Enter a valid email");
      return;
    }
    setForgotSubmitting(true);
    setForgotError(null);
    try {
      await apiPost("/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      setForgotError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setForgotSubmitting(false);
    }
  }

  async function handleSendPhoneCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Enter a valid 10-digit phone number");
      return;
    }
    setPhoneSubmitting(true);
    setPhoneError(null);
    try {
      await sendPhoneOtp(phone);
      setPhoneStep("code");
    } catch (err) {
      setPhoneError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setPhoneSubmitting(false);
    }
  }

  async function handleResendPhoneCode() {
    setPhoneSubmitting(true);
    setPhoneError(null);
    try {
      await sendPhoneOtp(phone);
      setPhoneCodeResent(true);
    } catch (err) {
      setPhoneError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setPhoneSubmitting(false);
    }
  }

  async function handleVerifyPhoneCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(phoneCode)) {
      setPhoneError("Enter the 6-digit code");
      return;
    }
    setPhoneSubmitting(true);
    setPhoneError(null);
    try {
      await verifyPhoneOtp(phone, phoneCode, phoneFullName.trim() || undefined);
    } catch (err) {
      setPhoneError(err instanceof ApiError ? err.message : "That code is invalid or has expired.");
    } finally {
      setPhoneSubmitting(false);
    }
  }

  const heading =
    method === "phone"
      ? phoneStep === "enter"
        ? "Log in or sign up"
        : "Enter your code"
      : tab === "login"
        ? "Log in"
        : tab === "signup"
          ? "Create your account"
          : tab === "verify"
            ? "Check your email"
            : "Reset your password";

  const subheading =
    method === "phone"
      ? phoneStep === "enter"
        ? "We'll text you a one-time code — no password needed."
        : `Enter the 6-digit code we sent to ${phone}.`
      : tab === "login"
        ? "Sign in to track orders and book your consults."
        : tab === "signup"
          ? "Track orders, book consults and keep your details handy."
          : tab === "verify"
            ? `Enter the 6-digit code we sent to ${pendingVerificationEmail ?? "your email"}.`
            : "We'll email you a link to set a new one.";

  return (
    <div className="max-w-[440px] mx-auto">
      <h1 className="font-serif font-medium text-3xl text-center mb-1.5 text-ink">{heading}</h1>
      <p className="text-center text-[0.92rem] mb-6.5 text-muted">{subheading}</p>

      <div className="bg-surface border border-line rounded-lg p-8.5">
        {method === "email" && tab !== "forgot" && tab !== "verify" && (
          <div className="text-center mb-6.5">
            <div className="inline-flex bg-bg-3 rounded-pill p-1">
              {(["login", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={[
                    "py-2.5 px-5 rounded-pill text-sm font-semibold transition-colors",
                    tab === t ? "bg-surface text-ink shadow-sm" : "text-muted",
                  ].join(" ")}
                >
                  {t === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>
          </div>
        )}

        {method === "phone" ? (
          phoneStep === "code" ? (
            <form onSubmit={handleVerifyPhoneCode} className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className={inputClass(!!phoneError)}
                />
                {phoneError && <p className="text-[0.78rem] text-error mt-1.5">{phoneError}</p>}
                {phoneCodeResent && !phoneError && (
                  <p className="text-[0.78rem] text-sage mt-1.5">A new code was sent.</p>
                )}
              </div>
              <button
                type="submit"
                disabled={phoneSubmitting}
                className="w-full bg-gold text-white font-semibold py-4 rounded-pill hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {phoneSubmitting ? "Verifying…" : "Verify & continue"}
              </button>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep("enter");
                    setPhoneCode("");
                    setPhoneError(null);
                  }}
                  className="text-[0.82rem] font-semibold text-ink-2"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleResendPhoneCode}
                  disabled={phoneSubmitting}
                  className="text-[0.82rem] font-semibold text-gold-deep disabled:opacity-60"
                >
                  {phoneSubmitting ? "Sending…" : "Resend code"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendPhoneCode} className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                  Phone number <span className="text-gold-deep">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile"
                  className={inputClass(!!phoneError)}
                />
                {phoneError && <p className="text-[0.78rem] text-error mt-1.5">{phoneError}</p>}
              </div>
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                  Full name <span className="text-muted">(if you&rsquo;re new here)</span>
                </label>
                <input
                  value={phoneFullName}
                  onChange={(e) => setPhoneFullName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass(false)}
                />
              </div>
              <button
                type="submit"
                disabled={phoneSubmitting}
                className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {phoneSubmitting ? "Sending…" : "Send code"}
              </button>
            </form>
          )
        ) : tab === "verify" ? (
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className={inputClass(!!verifyError)}
              />
              {verifyError && <p className="text-[0.78rem] text-error mt-1.5">{verifyError}</p>}
              {resendSent && !verifyError && <p className="text-[0.78rem] text-sage mt-1.5">A new code was sent.</p>}
            </div>
            <button
              type="submit"
              disabled={verifySubmitting}
              className="w-full bg-gold text-white font-semibold py-4 rounded-pill hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifySubmitting ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendSubmitting}
              className="text-[0.82rem] font-semibold text-ink-2 disabled:opacity-60"
            >
              {resendSubmitting ? "Sending…" : "Resend code"}
            </button>
          </form>
        ) : tab === "forgot" ? (
          forgotSent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-3">
                <Icon name="check" size={22} />
              </div>
              <p className="text-ink-2 text-[0.94rem] m-0">
                If an account exists for <strong>{forgotEmail}</strong>, we&rsquo;ve sent a reset link — check your
                inbox (and spam folder).
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                  Email <span className="text-gold-deep">*</span>
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputClass(!!forgotError)}
                />
                {forgotError && <p className="text-[0.78rem] text-error mt-1.5">{forgotError}</p>}
              </div>
              <button
                type="submit"
                disabled={forgotSubmitting}
                className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {forgotSubmitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "signup" && (
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                  Full name <span className="text-gold-deep">*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass(!!errors.fullName)}
                />
                {errors.fullName && <p className="text-[0.78rem] text-error mt-1.5">{errors.fullName}</p>}
              </div>
            )}

            <div>
              <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                Email <span className="text-gold-deep">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-[0.78rem] text-error mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[0.82rem] font-medium text-ink-2">
                  Password <span className="text-gold-deep">*</span>
                </label>
                {tab === "login" && (
                  <button
                    type="button"
                    onClick={() => switchTab("forgot")}
                    className="text-[0.78rem] font-semibold text-gold-deep"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass(!!errors.password)}
              />
              {errors.password && <p className="text-[0.78rem] text-error mt-1.5">{errors.password}</p>}
            </div>

            {submitError && <p className="text-[0.85rem] text-error m-0">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Please wait…" : tab === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        )}

        {method === "email" && tab !== "forgot" && tab !== "verify" && (
          <p className="flex gap-2.5 items-start text-[0.78rem] text-muted mt-4.5">
            <Icon name="lock" size={15} className="shrink-0 mt-0.5" />
            <span>Your i do website account is separate from the i do app — sign up here to track orders and consults.</span>
          </p>
        )}

        {method === "email" && tab !== "forgot" && tab !== "verify" && (
          <div className="text-center mt-4.5 text-[0.88rem] text-muted">
            {tab === "login" ? (
              <>
                New here?{" "}
                <button type="button" onClick={() => switchTab("signup")} className="text-gold-deep font-semibold">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have one?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-gold-deep font-semibold">
                  Log in
                </button>
              </>
            )}
          </div>
        )}

        {method === "email" && tab === "forgot" && (
          <div className="text-center mt-4.5 text-[0.88rem] text-muted">
            <button type="button" onClick={() => switchTab("login")} className="text-gold-deep font-semibold">
              Back to log in
            </button>
          </div>
        )}

        {(method === "email" ? tab !== "verify" : true) && (
          <div className="text-center mt-5 pt-4.5 border-t border-line text-[0.88rem]">
            <button
              type="button"
              onClick={() => switchMethod(method === "email" ? "phone" : "email")}
              className="text-gold-deep font-semibold"
            >
              {method === "email" ? "Continue with phone number instead" : "Continue with email instead"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
