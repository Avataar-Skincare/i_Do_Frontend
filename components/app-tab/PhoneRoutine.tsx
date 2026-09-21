import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "./PhoneFrame";
import { MiniRing } from "./MiniRing";
import { ROUTINE_SCREEN } from "@/lib/content/app-tab";

export function PhoneRoutine() {
  return (
    <PhoneFrame active="">
      <div className="text-[10px] font-semibold text-ink pt-1">Your Routine</div>

      <div className="flex gap-1">
        {ROUTINE_SCREEN.days.map((day) => (
          <div
            key={day.dow}
            className={[
              "flex-1 text-center rounded-md py-1",
              day.active ? "bg-nav text-white" : "bg-surface border border-line text-ink-2",
            ].join(" ")}
          >
            <div className="text-[5.5px] font-mono uppercase tracking-[0.05em] opacity-70">{day.dow}</div>
            <div className="font-serif text-xs leading-none mt-0.5">{day.d}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-lg p-2">
        <div className="flex items-center justify-between">
          <span className="text-[6px] font-mono uppercase tracking-[0.06em] text-muted">
            Today · Routine adherence
          </span>
          <span className="text-[6px] text-gold-deep font-semibold">🔥 {ROUTINE_SCREEN.streak}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <MiniRing value={ROUTINE_SCREEN.percent} size={44} strokeWidth={4}>
            <div className="font-serif text-xs leading-none text-ink">{ROUTINE_SCREEN.percent}%</div>
          </MiniRing>
          <div className="flex-1 flex flex-col gap-1">
            {ROUTINE_SCREEN.breakdown.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[6.5px]">
                <span className="text-ink-2">{row.label}</span>
                <span className="font-semibold text-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[6px] text-muted text-center mt-1.5 border-t border-line pt-1.5">
          {ROUTINE_SCREEN.summary}
        </div>
      </div>

      <div className="overflow-y-auto flex flex-col gap-2">
        <RoutineList label="Morning topical products" items={ROUTINE_SCREEN.morning} />
        <RoutineList label="Evening topical products" items={ROUTINE_SCREEN.evening} />
      </div>
    </PhoneFrame>
  );
}

function RoutineList({
  label,
  items,
}: {
  label: string;
  items: Array<{ name: string; note: string; done: boolean }>;
}) {
  const doneCount = items.filter((i) => i.done).length;
  return (
    <div>
      <div className="flex items-center justify-between text-[6px] font-mono uppercase tracking-[0.06em] text-muted mb-1">
        <span>{label}</span>
        <span>
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 bg-surface border border-line rounded-md py-1 px-1.5">
            <span
              className={[
                "w-2.5 h-2.5 rounded-full border shrink-0 grid place-items-center",
                item.done ? "bg-sage border-sage text-white" : "border-line-2",
              ].join(" ")}
            >
              {item.done && <Icon name="check" size={7} />}
            </span>
            <div className="min-w-0">
              <div className="text-[6.5px] font-medium text-ink truncate">{item.name}</div>
              {item.note && <div className="text-[5.5px] text-muted truncate">{item.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
