"use client";

import { useState, type FormEvent } from "react";
import { Section } from "@/components/ui/Section";

/** No email backend exists yet (see PRD: "just shows a toast today — no real send"). */
export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
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
          <form onSubmit={onSubmit} className="flex gap-2.5 flex-wrap">
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              required
              aria-label="Email"
              className="flex-1 min-w-[200px] bg-bg-2 border border-line-2 rounded-pill py-3.5 px-5 text-[0.95rem] focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="bg-nav text-[#F3ECDD] font-semibold py-3.5 px-6 rounded-pill hover:bg-black transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
