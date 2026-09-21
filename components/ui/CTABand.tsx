import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function CTABand({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: {
  eyebrow?: string;
  title: ReactNode;
  body: ReactNode;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Section>
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-nav),#1a1611)] rounded-lg py-16 px-12 text-center">
        <div className="absolute w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(192,161,91,0.22),transparent_65%)] -top-40 -right-24" />
        <div className="relative">
          {eyebrow && (
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-soft mb-4">
              {eyebrow}
            </div>
          )}
          <h2 className="font-serif font-medium text-[#F5EEDD] text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] max-w-xl mx-auto mb-4">
            {title}
          </h2>
          <p className="text-[#B8AC94] max-w-[52ch] mx-auto mb-7">{body}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <LinkButton href={ctaHref} size="lg">
              {ctaLabel}
            </LinkButton>
            {secondaryLabel && secondaryHref && (
              <LinkButton href={secondaryHref} variant="ghost-invert" size="lg">
                {secondaryLabel}
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
