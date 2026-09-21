"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const ITEMS: Array<{ icon: "spark" | "truck" | "heart"; text: string }> = [
  { icon: "spark", text: "Free dermatologist + dietician consult with every ring" },
  { icon: "truck", text: "Free shipping across India" },
  { icon: "heart", text: "No subscription, ever" },
];

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-nav text-[#EFE7D6]">
      <div className="relative flex flex-wrap items-center justify-center gap-6 py-2.5 pr-10 pl-6">
        {ITEMS.map((item, i) => (
          <span key={item.text} className="inline-flex items-center gap-2 text-[0.82rem] text-[#E7DEC9]">
            <Icon name={item.icon} size={14} />
            {item.text}
            {i < ITEMS.length - 1 && (
              <i className="hidden sm:inline-block w-1 h-1 rounded-full bg-gold-soft opacity-70 ml-4" />
            )}
          </span>
        ))}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C9BFAA] hover:text-white text-lg leading-none p-1"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
