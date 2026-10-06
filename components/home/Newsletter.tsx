"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/ui/Section";
import { apiPost, ApiError } from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/newsletter/subscribe", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section size="sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-surface border border-line rounded-lg p-11">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
            The Circle, in your inbox
          </div>
          <h3 className="font-serif font-medium text-[1.9rem] mb-2">Skin-first science, once a week.</h3>
          <p className="text-muted m-0">
            Cycle-aware skincare, glow-friendly nutrition and the occasional early drop. No noise.
          </p>
        </div>
        {submitted ? (
          <p className="text-ink-2 font-medium">You&rsquo;re subscribed — welcome to The Circle.</p>
        ) : (
          <div>
            <form onSubmit={onSubmit} className="flex gap-2.5 flex-wrap">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                aria-label="Email"
                className="flex-1 min-w-[200px] bg-bg-2 border border-line-2 rounded-pill py-3.5 px-5 text-[0.95rem] focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-nav text-[#F3ECDD] font-semibold py-3.5 px-6 rounded-pill hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
            {error && <p className="text-[0.82rem] text-error mt-2 mb-0">{error}</p>}
          </div>
        )}
      </div>
    </Section>
  );
}
