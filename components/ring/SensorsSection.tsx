import { Icon } from "@/components/ui/Icon";
import { Note } from "@/components/ui/Note";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { SENSORS } from "@/lib/content/ring";

export function SensorsSection() {
  return (
    <Section>
      <SectionHead
        center
        eyebrow="The sensors"
        title="Four signals, read all day and night"
        lede="i do samples continuously and syncs quietly to the app — no tapping, no thinking about it."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-10">
        {SENSORS.map((sensor) => (
          <div key={sensor.title} className="bg-surface border border-line rounded-card p-7">
            <div className="w-10 h-10 rounded-xl bg-gold-tint text-gold-deep grid place-items-center mb-4.5">
              <Icon name={sensor.icon} size={20} />
            </div>
            <h4 className="text-xl mb-2">{sensor.title}</h4>
            <p className="text-ink-2 text-[0.94rem] m-0">{sensor.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Note tone="sage">
          i do is a wellness and beauty-tech device. Its readings support your skin and lifestyle
          choices and are not intended to diagnose, treat or prevent any medical condition.
        </Note>
      </div>
    </Section>
  );
}
