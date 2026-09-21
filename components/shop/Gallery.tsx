"use client";

import { useState } from "react";
import Image from "next/image";
import { GALLERY } from "@/lib/content/shop";

export function Gallery() {
  const [active, setActive] = useState(0);
  const current = GALLERY[active];

  return (
    <div className="lg:sticky lg:top-[90px]">
      <div className="relative aspect-square rounded-lg overflow-hidden border border-line bg-surface-2">
        <Image src={current.src} alt={current.alt} fill sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" priority />
      </div>
      <div className="flex gap-2.5 mt-3 flex-wrap">
        {GALLERY.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={[
              "relative w-[72px] h-[72px] rounded-xl overflow-hidden border-[1.5px] transition-colors shrink-0",
              active === i ? "border-gold" : "border-line",
            ].join(" ")}
          >
            <Image src={img.src} alt={img.alt} fill sizes="72px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
