import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

const PHASES: Array<{ name: string; note: string; on?: boolean }> = [
  { name: "Menstrual", note: "Soothe & hydrate" },
  { name: "Follicular", note: "Push actives", on: true },
  { name: "Ovulation", note: "Peak glow" },
  { name: "Luteal", note: "Calm & protect" },
];

export function CycleBanner() {
  return (
    <Section size="sm">
      <div className="bg-[linear-gradient(120deg,var(--color-gold-tint),var(--color-bg-2))] border border-gold-wash rounded-lg p-11 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-9 items-center">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
            Cycle intelligence
          </div>
          <h3 className="font-serif font-medium text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.08] mb-3.5">
            Your skin changes all month.
            <br />
            Now your routine can too.
          </h3>
          <p className="text-muted">
            Oestrogen and progesterone reshape your skin week to week. i do maps where you are in
            your cycle and tells you when to push actives — and when to be kind.
          </p>
          <div className="flex gap-2.5 flex-wrap mt-5">
            {PHASES.map((phase) => (
              <div
                key={phase.name}
                className={[
                  "flex-1 min-w-[120px] bg-surface rounded-sm py-3.5 px-4 border",
                  phase.on ? "border-gold shadow-[0_0_0_1px_var(--color-gold)]" : "border-line",
                ].join(" ")}
              >
                <div className="font-mono text-[0.72rem] tracking-[0.12em] uppercase text-muted">
                  {phase.name}
                </div>
                <div className={`font-semibold mt-1 text-[0.94rem] ${phase.on ? "text-gold-deep" : ""}`}>
                  {phase.note}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface rounded-card p-6 border-l-4 border-gold shadow-sm">
          <div className="font-mono text-[0.72rem] tracking-[0.14em] uppercase text-gold-deep mb-2.5 flex items-center gap-2">
            <Icon name="moon" size={13} /> Today · Day 14, Follicular
          </div>
          <p className="font-serif text-[1.35rem] leading-[1.35] text-ink">
            &ldquo;Your barrier is at its strongest. A good day for vitamin C and a little more
            sun-smart time outside.&rdquo;
          </p>
        </div>
      </div>
    </Section>
  );
}
