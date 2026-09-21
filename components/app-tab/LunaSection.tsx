import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { LUNA_FEATURES } from "@/lib/content/app-tab";
import { PhoneScores } from "./PhoneScores";

export function LunaSection() {
  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-center">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">Meet Luna</div>
          <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-3.5">
            Your AI skin coach, on call
          </h2>
          <p className="text-ink-2 max-w-[60ch] mb-6">
            Luna reads your scores, your phase and your day, then tells you what to actually do —
            the serum to skip tonight, the protein to add at lunch, the walk that&rsquo;ll help you
            de-puff by morning.
          </p>
          <div className="flex flex-col gap-4">
            {LUNA_FEATURES.map((feat) => (
              <div key={feat.title} className="flex gap-3.5">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-tint text-gold-deep grid place-items-center">
                  <Icon name={feat.icon} size={18} />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-1">{feat.title}</h4>
                  <p className="text-ink-2 text-[0.94rem] m-0">{feat.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <figure className="flex flex-col items-center m-0">
          <PhoneScores active="" />
          <figcaption className="text-center mt-3.5 text-[0.82rem] text-muted font-mono tracking-[0.04em]">
            Luna&rsquo;s recommendations, from your scores
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
