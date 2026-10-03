"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { getOrderClaimInfo, type OrderClaimInfo } from "@/lib/claim-order";
import { ApiError } from "@/lib/api";

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

export function ClaimOrderForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const { claimOrder } = useAuth();

  const [info, setInfo] = useState<OrderClaimInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getOrderClaimInfo(token)
      .then(setInfo)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Couldn't load this link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    if (!info?.hasAccount && password.length < 8) {
      setSubmitError("At least 8 characters");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await claimOrder(token, info?.hasAccount ? undefined : { password, fullName: fullName.trim() });
      router.push("/account");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-muted">Loading…</div>;
  }

  if (!token || loadError) {
    return (
      <div className="max-w-[440px] mx-auto text-center">
        <h1 className="font-serif font-medium text-3xl mb-1.5 text-ink">Invalid link</h1>
        <p className="text-ink-2 text-[0.94rem]">
          {loadError ?? "This link is missing its token."} If your order confirmation email had a different link,
          use that one, or{" "}
          <Link href="/support" className="text-gold-deep font-semibold">
            contact support
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[440px] mx-auto">
      <h1 className="font-serif font-medium text-3xl text-center mb-1.5 text-ink">
        {info?.hasAccount ? "Add this order to your account" : "Create your account"}
      </h1>
      <p className="text-center text-[0.92rem] mb-6.5 text-muted">
        {info?.hasAccount
          ? `We'll attach order ${info.orderId} to your existing account (${info.email}).`
          : `Order ${info?.orderId} — set a password for ${info?.email} to track it (and future orders) from your account.`}
      </p>

      <div className="bg-surface border border-line rounded-lg p-8.5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!info?.hasAccount && (
            <>
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
                  Password <span className="text-gold-deep">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass(!!submitError)}
                />
              </div>
            </>
          )}

          {submitError && <p className="text-[0.85rem] text-error m-0">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-white font-semibold py-4 rounded-pill mt-1.5 hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Please wait…" : info?.hasAccount ? "Attach order & log in" : "Create account"}
          </button>
        </form>

        <p className="flex gap-2.5 items-start text-[0.78rem] text-muted mt-4.5">
          <Icon name="lock" size={15} className="shrink-0 mt-0.5" />
          <span>This link only works once and only for this order.</span>
        </p>
      </div>
    </div>
  );
}
