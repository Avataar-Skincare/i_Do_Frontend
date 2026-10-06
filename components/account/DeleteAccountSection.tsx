"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

/** Two-step, in-place confirmation — no browser confirm() dialog, matching the rest of the site's UI. */
export function DeleteAccountSection() {
  const { deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      // No redirect needed — AccountClient shows AuthForm as soon as `user` is null,
      // the same way it already does right after logout.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete your account — check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-10 border border-error/30 bg-error/5 rounded-lg p-6">
      <h3 className="text-base font-semibold text-ink mb-1.5">Delete account</h3>
      <p className="text-ink-2 text-[0.9rem] m-0">
        This is permanent. Your past orders are kept for our records but stripped of your name, email and
        address; any consult bookings are removed entirely.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 text-[0.9rem] font-semibold text-error underline"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-[0.9rem] font-medium text-ink mb-3">Are you sure? This can&rsquo;t be undone.</p>
          {error && <p className="text-[0.85rem] text-error mb-3">{error}</p>}
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 text-[0.9rem] font-semibold text-white bg-error rounded-pill py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="close" size={15} /> {deleting ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
              disabled={deleting}
              className="text-[0.9rem] font-semibold text-muted underline disabled:opacity-50"
            >
              Never mind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
