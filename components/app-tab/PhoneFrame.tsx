import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { NAV_TABS } from "@/lib/content/app-tab";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold text-ink shrink-0">
      <span>9:41</span>
      <span className="flex items-center gap-1 text-ink">
        <Icon name="battery" size={13} />
      </span>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <div className="shrink-0 bg-nav mx-2 mb-2 rounded-2xl px-2 py-2 flex items-center justify-between">
      {NAV_TABS.slice(0, 2).map((tab) => (
        <NavItem key={tab.key} tab={tab} isActive={tab.key === active} />
      ))}
      <span className="w-7 h-7 rounded-full bg-gold grid place-items-center text-white text-sm font-bold shrink-0">
        +
      </span>
      {NAV_TABS.slice(2).map((tab) => (
        <NavItem key={tab.key} tab={tab} isActive={tab.key === active} />
      ))}
    </div>
  );
}

function NavItem({ tab, isActive }: { tab: (typeof NAV_TABS)[number]; isActive: boolean }) {
  return (
    <span className={`flex flex-col items-center gap-0.5 ${isActive ? "text-gold" : "text-white/45"}`}>
      <Icon name={tab.icon} size={14} />
      <span className="text-[6px] font-mono tracking-[0.06em] uppercase">{tab.label}</span>
    </span>
  );
}

export function PhoneFrame({
  active,
  children,
  className,
}: {
  active: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["relative rounded-[38px] bg-nav p-2.5 shadow-lg w-full max-w-[280px]", className].filter(Boolean).join(" ")}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-9 h-1.5 rounded-full bg-white/14 z-10" />
      <div className="rounded-[30px] bg-bg-2 overflow-hidden aspect-[9/18.5] flex flex-col">
        <StatusBar />
        <div className="flex-1 overflow-hidden px-3 pb-2 flex flex-col gap-2.5">{children}</div>
        <BottomNav active={active} />
      </div>
    </div>
  );
}
