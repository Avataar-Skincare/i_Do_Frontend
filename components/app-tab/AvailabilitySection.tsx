import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { AVAILABILITY_CHIPS } from "@/lib/content/app-tab";

export function AvailabilitySection() {
  return (
    <Section size="sm" bg="muted">
      <SectionHead
        center
        eyebrow="Availability"
        title="Free on iPhone & Android"
        lede="The i do app is included with your ring — iOS 12+ and Android 5.0+. Nothing to unlock, nothing to upgrade."
      />
      <div className="flex gap-3 justify-center flex-wrap mt-7">
        {AVAILABILITY_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 text-sm font-medium border border-line-2 rounded-pill py-2.5 px-4"
          >
            <Icon name={chip.icon} size={15} />
            {chip.label}
          </span>
        ))}
      </div>
    </Section>
  );
}
