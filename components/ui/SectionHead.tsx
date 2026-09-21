import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  title,
  lede,
  center = false,
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  center?: boolean;
  /** Use on a dark (nav) section background — swaps eyebrow/lede to light-on-dark tones. */
  dark?: boolean;
}) {
  return (
    <div className={["max-w-[64ch]", center && "mx-auto text-center"].filter(Boolean).join(" ")}>
      {eyebrow && (
        <div
          className={[
            "font-mono text-xs tracking-[0.2em] uppercase mb-4",
            dark ? "text-gold-soft" : "text-gold-deep",
          ].join(" ")}
        >
          {eyebrow}
        </div>
      )}
      <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-3.5">
        {title}
      </h2>
      {lede && (
        <p
          className={[
            "text-[1.14rem] leading-[1.65] max-w-[60ch]",
            dark ? "text-[#B3A78F]" : "text-ink-2",
            center && "mx-auto",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
