import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneHome } from "./PhoneHome";

export function AppHero() {
  return (
    <div className="pb-section-sm">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-11 items-center mt-8">
          <div className="flex justify-center">
            <PhoneHome />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
              Every morning
            </div>
            <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-3.5">
              Wake up to a number and a plan
            </h2>
            <p className="text-ink-2 max-w-[52ch] mb-6">
              Open the app to your Glow score, how you slept, where you are in your cycle, and
              Luna&rsquo;s top picks for skincare, food and movement today.
            </p>
            <div className="flex gap-3 flex-wrap items-center">
              <LinkButton href="/shop">Get the ring</LinkButton>
              <span className="inline-flex items-center gap-2 text-sm font-medium border border-line-2 rounded-pill py-2.5 px-4">
                <Icon name="check" size={15} className="text-gold" /> Free · no subscription
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
