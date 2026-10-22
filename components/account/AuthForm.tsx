"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type Method = "email" | "phone";
type Step = "enter" | "code";

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-base focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

/**
 * Every account is OTP-only — one unified two-step flow (enter identifier →
 * enter code) covers both signup and login, for both email and phone. There
 * is no password anywhere, so no separate "login" vs "signup" tab either —
 * verifying the code logs in an existing account or creates a new one,
 * whichever applies.
 */
export function AuthForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  // Phone is the default: the phone number is the account key shared with the ring app (LLD login boards).
  const [method, setMethod] = useState<Method>("phone");
  const [step, setStep] = useState<Step>("enter");

  const [identifier, setIdentifier] = useState(""); // email or 10-digit phone, depending on method
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeResent, setCodeResent] = useState(false);

  function switchMethod(next: Method) {
    setMethod(next);
    setStep("enter");
    setIdentifier("");
    setCode("");
    setError(null);
    setCodeResent(false);
  }

  function isValidIdentifier(value: string) {
    return method === "email" ? /^\S+@\S+\.\S+$/.test(value) : /^\d{10}$/.test(value);
  }

  async function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidIdentifier(identifier)) {
      setError(method === "email" ? "Enter a valid email" : "Enter a valid 10-digit phone number");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (method === "email") await sendEmailOtp(identifier);
      else await sendPhoneOtp(identifier);
      setStep("code");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setSubmitting(true);
    setError(null);
    try {
      if (method === "email") await sendEmailOtp(identifier);
      else await sendPhoneOtp(identifier);
      setCodeResent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const name = fullName.trim() || undefined;
      if (method === "email") await verifyEmailOtp(identifier, code, name);
      else await verifyPhoneOtp(identifier, code, name);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[440px] mx-auto">
      <h1 className="font-serif font-medium text-3xl text-center mb-1.5 text-ink">
        {step === "enter" ? "Log in or sign up" : "Enter your code"}
      </h1>
      <p className="text-center text-[0.92rem] mb-6.5 text-muted">
        {step === "enter"
          ? method === "email"
            ? "We'll email you a one-time code — no password needed."
            : "We'll text you a one-time code — no password needed."
          : `Enter the 6-digit code we sent to ${identifier}.`}
      </p>

      <div className="bg-surface border border-line rounded-lg p-8.5">
        {step === "code" ? (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className={inputClass(!!error)}
              />
              {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
              {codeResent && !error && <p className="text-[0.78rem] text-sage mt-1.5">A new code was sent.</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-white font-semibold py-4 rounded-pill hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Verifying…" : "Verify & continue"}
            </button>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep("enter");
                  setCode("");
                  setError(null);
                }}
                className="text-[0.82rem] font-semibold text-ink-2"
              >
                Change {method === "email" ? "email" : "number"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={submitting}
                className="text-[0.82rem] font-semibold text-gold-deep disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Resend code"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                {method === "email" ? "Email" : "Phone number"} <span className="text-gold-deep">*</span>
              </label>
              <input
                type={method === "email" ? "email" : "tel"}
                inputMode={method === "email" ? undefined : "numeric"}
                value={identifier}
                onChange={(e) =>
                  setIdentifier(method === "email" ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder={method === "email" ? "you@email.com" : "10-digit mobile"}
                className={inputClass(!!error)}
              />
              {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
            </div>
            <div>
              <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                Full name <span className="text-muted">(if you&rsquo;re new here)</span>
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className={inputClass(false)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send code"}
            </button>
          </form>
        )}

        <div className="text-center mt-5 pt-4.5 border-t border-line text-[0.88rem]">
          <button
            type="button"
            onClick={() => switchMethod(method === "email" ? "phone" : "email")}
            className="text-gold-deep font-semibold"
          >
            {method === "email" ? "Continue with phone number instead" : "Continue with email instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
