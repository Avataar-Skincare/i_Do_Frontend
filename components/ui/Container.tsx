import type { ReactNode } from "react";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["w-full max-w-content mx-auto px-6", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
