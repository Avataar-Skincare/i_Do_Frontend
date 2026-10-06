"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export function VerifyEmailBanner() {
  const { user, verifyEmail, resendVerificationEmail } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  // No email at all (phone-only signup) — nothing to verify.
  if (!user || !user.email || user.emailVerifiedAt) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await verifyEmail(code);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await resendVerificationEmail();
      setResent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="bg-gold-tint border border-gold-wash rounded-lg p-4.5 mb-6 flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <Icon name="mail" size={18} className="shrink-0 mt-0.5 text-gold-deep" />
        <div className="flex-1">
          <p className="text-[0.92rem] text-ink m-0">
            Verify your email — <strong>{user.email}</strong>. We use it for order and consult confirmations.
          </p>
          {!open && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[0.85rem] font-semibold text-gold-deep mt-1.5"
            >
              Enter code
            </button>
          )}
        </div>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full bg-surface border-[1.5px] border-line-2 rounded-sm py-2.5 px-3.5 text-[0.94rem] focus:outline-none focus:border-gold"
            />
            {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
            {resent && !error && <p className="text-[0.78rem] text-sage mt-1.5">A new code was sent.</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gold text-white font-semibold py-2.5 px-5 rounded-pill hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[0.85rem] font-semibold text-ink-2 px-2 whitespace-nowrap disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
