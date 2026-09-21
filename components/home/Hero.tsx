import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RingImage } from "@/components/ui/RingImage";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";
import { ProgressRing } from "./ProgressRing";

export function Hero() {
  return (
    <section className="pt-14 pb-10 overflow-hidden">
      <div className="max-w-content mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 items-center">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-5">
            The skin-first smart ring · by {SITE.parent}
          </div>
          <h1 className="font-serif font-medium text-[clamp(2.7rem,5.6vw,4.7rem)] leading-[1.0] tracking-[-0.015em] mb-5.5">
            Your skin has been
            <br />
            trying to tell you
            <br />
            something. <em className="italic text-gold-deep">i do</em> listens.
          </h1>
          <p className="text-[1.16rem] leading-[1.65] text-ink-2 max-w-[60ch] mb-7.5">
            One quietly beautiful titanium ring reads your sleep, cycle and vitals — and turns
            them into eight skin scores, so you know exactly how to glow. No subscription. Made
            for India.
          </p>
          <div className="flex gap-3 flex-wrap items-center">
            <LinkButton href="/shop" size="lg">
              Shop the ring <Icon name="arrow" size={18} />
            </LinkButton>
            <LinkButton href="/app" variant="ghost" size="lg">
              See the app
            </LinkButton>
          </div>
          <div className="flex items-baseline gap-2.5 mt-5.5">
            <span className="font-serif text-[1.7rem] text-ink">{formatINR(SITE.priceInPaise)}</span>
            <span className="text-muted line-through">{formatINR(SITE.mrpInPaise)}</span>
            <span className="text-[0.78rem] font-semibold text-sage bg-sage-bg py-1 px-2.5 rounded-pill">
              Save {formatINR(SITE.mrpInPaise - SITE.priceInPaise)}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4.5 gap-y-2 mt-6.5 text-muted text-[0.83rem]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={15} className="text-gold" /> One-time price
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={15} className="text-gold" /> Free consults included
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={15} className="text-gold" /> 3–7 day delivery · COD
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-square max-w-[520px] ml-auto flex items-center justify-center">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_42%,var(--color-gold-tint),transparent_62%)]" />
            <div className="relative w-[78%] aspect-square">
              <ProgressRing value={86} label="Glow score" sublabel="Glowing today" />
            </div>
            <div className="absolute top-[6%] -left-[2%] bg-surface border border-line rounded-2xl py-2.5 px-3.5 shadow flex items-center gap-2.5 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-sage" />
              <div>
                Barrier
                <br />
                <span className="font-medium text-muted text-[0.72rem]">82 · Strong</span>
              </div>
            </div>
            <div className="absolute bottom-[12%] -right-[4%] bg-surface border border-line rounded-2xl py-2.5 px-3.5 shadow flex items-center gap-2.5 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <div>
                Cycle
                <br />
                <span className="font-medium text-muted text-[0.72rem]">Day 14 · Follicular</span>
              </div>
            </div>
            <RingImage className="absolute w-[34%] rounded-full -bottom-[3%] right-[2%] shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
