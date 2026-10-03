"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { apiPost, ApiError } from "@/lib/api";

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 8) {
      setError("At least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/auth/reset-password", { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-[440px] mx-auto text-center">
        <h1 className="font-serif font-medium text-3xl mb-1.5 text-ink">Invalid link</h1>
        <p className="text-ink-2 text-[0.94rem]">
          This reset link is missing its token. Request a new one from the{" "}
          <Link href="/account" className="text-gold-deep font-semibold">
            login page
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-[440px] mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-4">
          <Icon name="check" size={26} />
        </div>
        <h1 className="font-serif font-medium text-3xl mb-2 text-ink">Password reset</h1>
        <p className="text-ink-2 text-[0.94rem] mb-5">Your password has been changed — you can log in with it now.</p>
        <Link
          href="/account"
          className="inline-block bg-gold text-white font-semibold py-3.5 px-7 rounded-pill hover:bg-gold-deep transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[440px] mx-auto">
      <h1 className="font-serif font-medium text-3xl text-center mb-1.5 text-ink">Set a new password</h1>
      <p className="text-center text-[0.92rem] mb-6.5 text-muted">Make it at least 8 characters.</p>

      <div className="bg-surface border border-line rounded-lg p-8.5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
              New password <span className="text-gold-deep">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass(!!error)}
            />
          </div>
          <div>
            <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
              Confirm password <span className="text-gold-deep">*</span>
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputClass(!!error)}
            />
            {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
