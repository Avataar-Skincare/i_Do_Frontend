"use client";

import { useEffect, useState } from "react";

/** The hero's animated Glow-score ring, ported from the prototype's `.ringviz` + `animateRings()`. */
export function ProgressRing({ value, label, sublabel }: { value: number; label: string; sublabel: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (mounted ? value / 100 : 0) * circumference;

  return (
    <div className="relative w-full aspect-square">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="goldgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D8BE85" />
            <stop offset="1" stopColor="#A6843C" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-gold-wash)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#goldgrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-serif font-medium text-[clamp(3.4rem,9vw,5.6rem)] leading-[0.9] text-ink">
          {mounted ? value : 0}
        </div>
        <div className="font-mono text-[0.7rem] tracking-[0.22em] uppercase text-gold-deep mt-2.5">
          {label}
        </div>
        <div className="text-[0.8rem] text-sage font-semibold mt-1.5">{sublabel}</div>
      </div>
    </div>
  );
}
