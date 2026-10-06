"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { AuthForm } from "@/components/account/AuthForm";

export function AuthModal({ onClose, lead }: { onClose: () => void; lead?: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[440px]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 shrink-0 rounded-full bg-surface shadow-md grid place-items-center text-ink hover:text-gold-deep"
        >
          <Icon name="close" size={16} />
        </button>
        {/* One solid card for the whole modal — the lead-in text sits on this same
            background as AuthForm's own heading, so its color never depends on how
            the backdrop behind it renders (which is unreliable to guess at). */}
        <div className="max-h-[90vh] overflow-y-auto rounded-lg bg-surface shadow-lg p-6">
          <p className="text-center text-ink-2 text-[0.92rem] leading-relaxed mb-4">
            {lead ?? "Log in or create an account to continue — we'll pick up right where you left off."}
          </p>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
