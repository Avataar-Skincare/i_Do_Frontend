import type { ReactNode } from "react";

/** A static (non-animated) progress ring for small phone-mockup contexts. */
export function MiniRing({
  value,
  size = 72,
  strokeWidth = 6,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const c = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-gold-wash)" strokeWidth={strokeWidth} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
