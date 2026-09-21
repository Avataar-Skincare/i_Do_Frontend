import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

type Tone = "gold" | "sage";

const TONE: Record<Tone, { box: string; icon: string }> = {
  gold: { box: "bg-gold-tint border border-gold-wash", icon: "text-gold-deep" },
  sage: { box: "bg-sage-bg border border-transparent", icon: "text-sage" },
};

export function Note({
  tone = "gold",
  icon = "info",
  children,
}: {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={`${t.box} rounded-sm py-4 px-4.5 text-[0.9rem] text-ink-2 flex gap-3 items-start`}>
      <Icon name={icon} size={20} className={`${t.icon} shrink-0 mt-0.5`} />
      <div>{children}</div>
    </div>
  );
}
