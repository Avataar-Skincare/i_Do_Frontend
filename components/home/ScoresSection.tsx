import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { SCORES, type Tone } from "@/lib/content/home";

const TONE_CLASSES: Record<Tone, { bar: string; iconBg: string; iconText: string; accentBorder: string }> = {
  gold: { bar: "bg-gold", iconBg: "bg-gold-wash", iconText: "text-gold-deep", accentBorder: "before:bg-gold" },
  sage: { bar: "bg-sage", iconBg: "bg-sage-bg", iconText: "text-sage", accentBorder: "before:bg-sage" },
  rust: { bar: "bg-rust", iconBg: "bg-rust-bg", iconText: "text-rust", accentBorder: "before:bg-rust" },
  plum: { bar: "bg-plum", iconBg: "bg-plum-bg", iconText: "text-plum", accentBorder: "before:bg-plum" },
};

export function ScoresSection() {
  return (
    <Section>
      <SectionHead
        center
        eyebrow="Not a fitness tracker"
        title="Eight scores your skin actually cares about"
        lede="Steps and calories won't tell you why you broke out. i do reads the signals that matter for skin — and turns them into numbers you can act on every morning."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {SCORES.map((score) => {
          const tone = TONE_CLASSES[score.tone];
          return (
            <div
              key={score.name}
              className={[
                "relative overflow-hidden bg-surface border border-line rounded-card shadow-sm p-5 pt-5 pb-4.5",
                "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1",
                tone.accentBorder,
              ].join(" ")}
            >
              <div className="flex items-start justify-between mb-5.5">
                <div className={`w-9.5 h-9.5 rounded-xl grid place-items-center ${tone.iconBg} ${tone.iconText}`}>
                  <Icon name={score.icon} size={19} />
                </div>
                <span className="inline-flex items-center text-[0.7rem] font-semibold tracking-[0.06em] uppercase py-1 px-2.5 rounded-pill bg-sage-bg text-sage">
                  {score.state}
                </span>
              </div>
              <h4 className="text-[0.95rem] font-semibold tracking-[-0.01em] mb-3">{score.name}</h4>
              <div className="font-serif font-medium text-4xl leading-[0.9] text-ink">
                {score.val}
                {score.unit && <span className="text-base text-muted ml-1">{score.unit}</span>}
              </div>
              <div className="h-1.5 rounded-sm bg-bg-3 my-3.5 overflow-hidden">
                <span className={`block h-full rounded-sm ${tone.bar}`} style={{ width: `${score.bar}%` }} />
              </div>
              <div className="flex items-center gap-1.5 text-[0.78rem] text-muted font-medium">
                <span className={score.trendUp ? "text-sage" : ""}>{score.trendUp ? "▲" : "◆"}</span>
                {score.trend}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2.5 text-muted text-[0.9rem] mt-5.5">
        <Icon name="info" size={16} />
        Illustrative scores shown. Your numbers are personal to you and update daily in the app.
      </div>
    </Section>
  );
}
