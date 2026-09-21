import type { ReactNode } from "react";
import { Container } from "./Container";

type Bg = "default" | "muted" | "nav";

const BG: Record<Bg, string> = {
  default: "",
  muted: "bg-bg-2",
  nav: "bg-nav text-[#EDE4D3]",
};

export function Section({
  children,
  size = "md",
  bg = "default",
  className,
  containerClassName,
}: {
  children: ReactNode;
  size?: "md" | "sm";
  bg?: Bg;
  className?: string;
  containerClassName?: string;
}) {
  const padding = size === "sm" ? "py-section-sm" : "py-section";
  return (
    <section className={[padding, BG[bg], className].filter(Boolean).join(" ")}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
