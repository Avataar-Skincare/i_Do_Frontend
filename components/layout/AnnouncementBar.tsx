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
          <span
            key={item.text}
            className={["items-center gap-2 text-[0.82rem] text-[#E7DEC9]", i === 0 ? "inline-flex" : "hidden sm:inline-flex"].join(" ")}
          >
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
          className="absolute right-1 top-1/2 -translate-y-1/2 min-w-11 min-h-11 grid place-items-center text-[#C9BFAA] hover:text-white text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
