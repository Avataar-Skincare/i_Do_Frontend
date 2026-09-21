import type { ReactNode } from "react";
import Link from "next/link";
import { WHATS_IN_THE_BOX, SPECIFICATIONS, SHIPPING_TEXT, WARRANTY_TEXT } from "@/lib/content/shop";

function AccordionItem({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="border-t border-line py-5 group">
      <summary className="list-none cursor-pointer flex items-center justify-between font-semibold text-base marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-xl font-normal text-gold-deep group-open:hidden">+</span>
        <span className="text-xl font-normal text-gold-deep hidden group-open:inline">–</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function ProductAccordion() {
  return (
    <div>
      <AccordionItem title="What's in the box" defaultOpen>
        <ul className="m-0 pl-5 flex flex-col gap-2 text-ink-2 text-[0.94rem]">
          {WHATS_IN_THE_BOX.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title="Specifications">
        <div>
          {SPECIFICATIONS.map(([label, value]) => (
            <div key={label} className="flex gap-6 py-2.5 border-b border-line last:border-none text-[0.9rem]">
              <span className="w-[38%] shrink-0 text-muted">{label}</span>
              <span className="text-ink font-medium">{value}</span>
            </div>
          ))}
        </div>
        <Link href="/ring" className="inline-block mt-4 font-semibold text-gold-deep underline text-[0.94rem]">
          See full technology page
        </Link>
      </AccordionItem>

      <AccordionItem title="Shipping & delivery">
        <p className="text-ink-2 text-[0.94rem] m-0">{SHIPPING_TEXT}</p>
      </AccordionItem>

      <AccordionItem title="Warranty & returns">
        <p className="text-ink-2 text-[0.94rem] m-0">
          {WARRANTY_TEXT}{" "}
          <Link href="/legal/returns" className="font-semibold text-gold-deep underline">
            Returns &amp; Warranty
          </Link>
          .
        </p>
      </AccordionItem>
    </div>
  );
}
