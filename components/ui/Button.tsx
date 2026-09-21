import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "dark" | "ghost" | "ghost-invert";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  gold: "bg-gold text-white shadow-[0_10px_24px_-10px_rgb(166_132_60_/_0.75)] hover:bg-gold-deep",
  dark: "bg-nav text-[#F3ECDD] hover:bg-black",
  ghost:
    "bg-transparent text-ink shadow-[inset_0_0_0_1.4px_var(--color-line-2)] hover:shadow-[inset_0_0_0_1.4px_var(--color-gold)] hover:text-gold-deep",
  /** Ghost variant for use on dark (nav) backgrounds — a separate variant instead of a
   *  className text-color override, since Tailwind utilities of equal specificity don't
   *  reliably respect JSX class order. */
  "ghost-invert":
    "bg-transparent text-[#EDE4D3] shadow-[inset_0_0_0_1.4px_rgba(255,255,255,0.25)] hover:shadow-[inset_0_0_0_1.4px_rgba(255,255,255,0.55)] hover:text-white",
};

const SIZE: Record<Size, string> = {
  sm: "text-sm py-[0.62em] px-[1.05em]",
  md: "text-[0.95rem] py-[0.86em] px-[1.55em]",
  lg: "text-[1.02rem] py-[1.06em] px-[2em]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold leading-none text-center transition active:translate-y-px";

function classes(variant: Variant, size: Size, className?: string) {
  return [BASE, VARIANT[variant], SIZE[size], className].filter(Boolean).join(" ");
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "gold",
  size = "md",
  children,
  className,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "gold",
  size = "md",
  children,
  className,
  href,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
