import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SITE } from "@/lib/content/site";

export function TrustStrip() {
  const items: Array<{ icon: IconName; text: ReactNode }> = [
    { icon: "award", text: <>As seen on <strong className="text-ink font-semibold">Shark Tank India</strong></> },
    { icon: "star", text: <><strong className="text-ink font-semibold">{SITE.rating}★</strong> from {SITE.customers} women</> },
    { icon: "heart", text: <><strong className="text-ink font-semibold">No subscription</strong>, ever</> },
    { icon: "lock", text: <><strong className="text-ink font-semibold">DPDP</strong> · data on-device</> },
    { icon: "shield", text: <><strong className="text-ink font-semibold">12-month</strong> warranty</> },
  ];

  return (
    <div className="border-y border-line bg-bg-2">
      <div className="max-w-content mx-auto px-6 flex flex-wrap items-center justify-between gap-5 py-5.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-[0.9rem] text-ink-2">
              <span className="w-8.5 h-8.5 rounded-full bg-gold-tint text-gold-deep grid place-items-center shrink-0">
                <Icon name={item.icon} size={18} />
              </span>
              <span>{item.text}</span>
            </div>
            {i < items.length - 1 && <span className="hidden md:block w-px h-8.5 bg-line-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
