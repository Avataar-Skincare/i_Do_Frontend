import { PhoneFrame } from "./PhoneFrame";
import { MiniRing } from "./MiniRing";
import { PLATE_SCREEN } from "@/lib/content/app-tab";

export function PhonePlate() {
  return (
    <PhoneFrame active="">
      <div className="text-[10px] font-semibold text-ink pt-1">Your plate</div>

      <div className="flex bg-bg-3 rounded-pill p-0.5 text-[6.5px] font-semibold">
        {PLATE_SCREEN.tabs.map((tab, i) => (
          <span
            key={tab}
            className={["flex-1 text-center py-1 rounded-pill", i === 0 ? "bg-surface text-ink shadow-sm" : "text-muted"].join(" ")}
          >
            {tab}
          </span>
        ))}
      </div>

      <div>
        <div className="text-[6px] text-muted mb-1">{PLATE_SCREEN.weekLabel}</div>
        <div className="flex gap-1">
          {PLATE_SCREEN.days.map((day, i) => (
            <div
              key={i}
              className={[
                "flex-1 text-center rounded-md py-1",
                day.active ? "bg-nav text-white" : "text-ink-2",
              ].join(" ")}
            >
              <div className="text-[5px] font-mono uppercase opacity-70">{day.dow}</div>
              <div className="text-[7px] font-semibold mt-0.5">{day.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg p-2 overflow-y-auto flex-1">
        <span className="inline-block text-[5.5px] font-bold tracking-[0.05em] uppercase py-0.5 px-1.5 rounded-pill bg-sage-bg text-sage mb-1.5">
          {PLATE_SCREEN.badge}
        </span>
        <div className="text-[9px] font-semibold text-ink">{PLATE_SCREEN.heading} ✨</div>
        <p className="text-[6.5px] leading-snug text-ink-2 mt-1 m-0">{PLATE_SCREEN.body}</p>

        <div className="text-[5.5px] font-mono uppercase tracking-[0.05em] text-muted mt-2">
          {PLATE_SCREEN.suggestionsLabel}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {PLATE_SCREEN.suggestions.map((s) => (
            <div key={s.name} className="bg-gold-tint rounded-md py-1 px-1.5">
              <div className="text-[6.5px] font-semibold text-ink">{s.name}</div>
              <div className="text-[5.5px] text-ink-2">{s.note}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-2">
          <MiniRing value={(PLATE_SCREEN.calories / PLATE_SCREEN.calorieGoal) * 100} size={56} strokeWidth={5}>
            <div className="font-serif text-sm leading-none text-ink">{PLATE_SCREEN.calories}</div>
            <div className="text-[5px] text-muted mt-0.5">of {PLATE_SCREEN.calorieGoal} kcal</div>
            <div className="text-[5px] text-sage font-semibold">{PLATE_SCREEN.caloriesLeft} left</div>
          </MiniRing>
        </div>
      </div>
    </PhoneFrame>
  );
}
