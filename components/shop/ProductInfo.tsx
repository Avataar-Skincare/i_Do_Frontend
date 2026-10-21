"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";
import { FINISHES, SIZES } from "@/lib/content/product";
import { GALLERY, PRODUCT, HIGHLIGHTS, CONSULT_CALLOUT, SIZING_KIT_IMAGE } from "@/lib/content/shop";
import { useCart } from "@/lib/cart-context";
import { ProductAccordion } from "./ProductAccordion";

export function ProductInfo() {
  const { addItem } = useCart();
  const [finishId, setFinishId] = useState(FINISHES[0].id);
  const [added, setAdded] = useState(false);

  const finish = FINISHES.find((f) => f.id === finishId)!;
  const mainImage = GALLERY[0].src;

  function handleAddToBag() {
    addItem({
      id: "ring",
      name: PRODUCT.name,
      finish: finish.name,
      size: "Sizing kit included",
      price: SITE.priceInPaise,
      qty: 1,
      image: mainImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-[0.9rem] text-muted mb-3">
        {SITE.socialProofEnabled && (
          <>
            <Icon name="star" size={16} className="text-gold" />
            <strong className="text-ink font-semibold">{SITE.rating}</strong>
            <span>· {SITE.customers} women on the Avataar platform ·</span>
          </>
        )}
        <Link href="/support" className="text-gold-deep font-semibold">
          Ask us anything
        </Link>
      </div>

      <h1 className="font-serif font-medium text-[clamp(2rem,4vw,2.9rem)] leading-[1.05] mb-1.5">
        {PRODUCT.name}
      </h1>
      <p className="text-muted mb-5">{PRODUCT.tagline}</p>

      <div className="flex items-baseline gap-3 mb-1.5">
        <span className="font-serif text-[2.3rem] font-medium">{formatINR(SITE.priceInPaise)}</span>
        <span className="text-muted line-through text-[1.1rem]">{formatINR(SITE.mrpInPaise)}</span>
        <span className="text-[0.78rem] font-bold text-white bg-gold py-1.5 px-3 rounded-pill">
          Save {formatINR(SITE.mrpInPaise - SITE.priceInPaise)}
        </span>
      </div>
      <p className="text-[0.85rem] text-muted mb-6">Inclusive of all taxes · Free shipping on prepaid orders</p>

      <div className="mb-5.5">
        <div className="flex justify-between items-center font-mono text-xs tracking-[0.1em] uppercase text-muted mb-3">
          <span>Finish</span>
          <span className="font-sans text-ink font-semibold tracking-normal normal-case">{finish.name}</span>
        </div>
        <div className="flex gap-3">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFinishId(f.id)}
              className={[
                "flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-[1.5px] transition-colors",
                finishId === f.id ? "border-gold" : "border-transparent",
              ].join(" ")}
            >
              <span className="w-8.5 h-8.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.12),0_2px_6px_rgb(0_0_0_/_0.16)]" style={{ background: f.swatch }} />
              <small className={["text-[0.72rem]", finishId === f.id ? "text-ink font-semibold" : "text-muted"].join(" ")}>
                {f.name}
              </small>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="font-mono text-xs tracking-[0.1em] uppercase text-muted mb-3">Sizing</div>

        <div className="w-full flex gap-3.5 items-start text-left p-4 rounded-xl border-[1.5px] border-gold bg-gold-tint/40 mb-3">
          <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={SIZING_KIT_IMAGE} alt="Sizing kit" fill sizes="56px" className="object-cover" />
          </div>
          <div>
            <div className="font-semibold text-[0.95rem] mb-0.5">Sizing kit included with your ring</div>
            <p className="text-[0.82rem] text-muted m-0">
              The sizing kit ships first. Try the sizers at home, then submit your size from your account and we ship
              your ring. You don&apos;t pick a size now, and once you submit it, it can&apos;t be changed.
            </p>
          </div>
        </div>

        <div className="text-[0.82rem] text-muted mb-2">Sizes currently available</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" aria-label="Sizes currently available">
          {SIZES.map((s) => (
            <span
              key={s.us}
              className="aspect-square rounded-xl border-[1.5px] border-line-2 bg-surface text-ink font-semibold grid place-items-center"
            >
              {s.us}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[0.82rem] text-muted mb-4">One ring per order.</p>

      <button
        onClick={handleAddToBag}
        className="w-full bg-gold text-white font-semibold py-4 rounded-pill inline-flex items-center justify-center gap-2.5 hover:bg-gold-deep transition-colors mb-6"
      >
        <Icon name="cart" size={18} />
        {added ? "Added to bag ✓" : `Add to bag · ${formatINR(SITE.priceInPaise)}`}
      </button>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {HIGHLIGHTS.map((h) => (
          <div key={h.text} className="flex items-center gap-2.5 text-[0.88rem] text-ink-2">
            <span className="w-8.5 h-8.5 rounded-lg bg-gold-tint text-gold-deep grid place-items-center shrink-0">
              <Icon name={h.icon} size={16} />
            </span>
            {h.text}
          </div>
        ))}
      </div>

      <div className="bg-[linear-gradient(120deg,var(--color-gold-tint),var(--color-bg-2))] border border-gold-wash rounded-card p-5.5 flex gap-3.5 items-start">
        <span className="w-10.5 h-10.5 rounded-xl bg-surface shadow-sm text-gold-deep grid place-items-center shrink-0">
          <Icon name="face" size={19} />
        </span>
        <div>
          <h4 className="text-base font-semibold mb-1">{CONSULT_CALLOUT.title}</h4>
          <p className="text-[0.88rem] text-ink-2 m-0">{CONSULT_CALLOUT.body}</p>
        </div>
      </div>

      <ProductAccordion />
    </div>
  );
}
