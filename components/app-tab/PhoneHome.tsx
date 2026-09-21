import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "./PhoneFrame";
import { MiniRing } from "./MiniRing";
import { HOME_SCREEN } from "@/lib/content/app-tab";

export function PhoneHome() {
  return (
    <PhoneFrame active="home">
      <div className="flex items-center justify-between pt-1">
        <span className="font-serif italic text-sm text-ink">i do</span>
        <div className="flex gap-1.5 text-ink">
          <Icon name="bell" size={13} />
          <Icon name="gear" size={13} />
        </div>
      </div>

      <div>
        <div className="font-serif text-lg leading-tight text-ink">{HOME_SCREEN.greeting}</div>
        <div className="text-[8px] font-mono uppercase tracking-[0.06em] text-muted mt-0.5">
          {HOME_SCREEN.date}
        </div>
      </div>

      <div className="flex justify-center py-1">
        <MiniRing value={HOME_SCREEN.glowScore} size={96} strokeWidth={7}>
          <div className="font-serif text-2xl leading-none text-ink">{HOME_SCREEN.glowScore}</div>
          <div className="text-[6px] font-mono tracking-[0.1em] uppercase text-gold-deep mt-1">Glow score</div>
          <div className="text-[6px] text-sage font-semibold mt-0.5">▲ {HOME_SCREEN.glowDelta}</div>
        </MiniRing>
      </div>

      <div>
        <div className="text-[10px] font-semibold text-ink mb-1.5">Scores to watch today</div>
        <div className="flex flex-wrap gap-1">
          {HOME_SCREEN.watchChips.map((chip) => (
            <span key={chip} className="text-[7px] font-medium border border-line-2 rounded-pill py-1 px-2 text-ink-2 bg-surface">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gold-tint rounded-lg p-2">
        <div className="text-[6px] font-mono tracking-[0.08em] uppercase text-gold-deep">{HOME_SCREEN.cycleLabel}</div>
        <p className="text-[7.5px] leading-snug text-ink-2 mt-1 m-0">{HOME_SCREEN.cycleNote}</p>
      </div>

      <div className="bg-surface rounded-lg p-2 border border-line">
        <div className="flex items-center gap-1 text-[9px] font-semibold text-ink">
          <Icon name="spark" size={10} className="text-gold-deep" /> Luna&rsquo;s Recommendations
        </div>
        <div className="text-[6px] font-mono tracking-[0.08em] uppercase text-muted mt-1.5">Skincare</div>
        <p className="text-[7px] text-muted mt-0.5 m-0">{HOME_SCREEN.lunaNote}</p>
      </div>
    </PhoneFrame>
  );
}
