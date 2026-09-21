import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "./PhoneFrame";
import { SCORES, type Tone } from "@/lib/content/home";

const TONE_CLASSES: Record<Tone, { bar: string; iconBg: string; iconText: string }> = {
  gold: { bar: "bg-gold", iconBg: "bg-gold-wash", iconText: "text-gold-deep" },
  sage: { bar: "bg-sage", iconBg: "bg-sage-bg", iconText: "text-sage" },
  rust: { bar: "bg-rust", iconBg: "bg-rust-bg", iconText: "text-rust" },
  plum: { bar: "bg-plum", iconBg: "bg-plum-bg", iconText: "text-plum" },
};

/** The other six of the eight scores — Glow and Barrier already headline the Home screen. */
const REST_OF_SCORES = SCORES.slice(2);

export function PhoneScores({ active = "scores" }: { active?: string }) {
  return (
    <PhoneFrame active={active}>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-semibold text-ink">Your scores</span>
        <span className="text-[7px] font-medium text-muted">Hide the rest</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 overflow-y-auto">
        {REST_OF_SCORES.map((score) => {
          const tone = TONE_CLASSES[score.tone];
          return (
            <div key={score.name} className="bg-surface border border-line rounded-lg p-1.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-4 h-4 rounded-md grid place-items-center ${tone.iconBg} ${tone.iconText}`}>
                  <Icon name={score.icon} size={9} />
                </span>
                <span className="text-[5.5px] font-bold tracking-[0.04em] uppercase py-0.5 px-1 rounded-pill bg-sage-bg text-sage">
                  {score.state}
                </span>
              </div>
              <div className="text-[7px] font-semibold text-ink leading-tight">{score.name}</div>
              <div className="font-serif text-base leading-none text-ink mt-1">
                {score.val}
                {score.unit && <span className="text-[6px] text-muted ml-0.5">{score.unit}</span>}
              </div>
              <div className="h-1 rounded-sm bg-bg-3 mt-1 overflow-hidden">
                <span className={`block h-full ${tone.bar}`} style={{ width: `${score.bar}%` }} />
              </div>
              <div className={`text-[5.5px] mt-1 ${score.trendUp ? "text-sage" : "text-rust"}`}>
                {score.trendUp ? "▲" : "▼"} {score.trend}
              </div>
            </div>
          );
        })}
      </div>
    </PhoneFrame>
  );
}
