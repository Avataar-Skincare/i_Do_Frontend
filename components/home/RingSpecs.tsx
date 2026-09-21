import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RingImage } from "@/components/ui/RingImage";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { FINISHES } from "@/lib/content/product";

const SPECS: Array<[string, string, string]> = [
  ["Weight", "2.9", "g"],
  ["Battery", "4–7", "days"],
  ["Water rating", "5", "ATM"],
  ["Charge time", "~1", "hour"],
];

export function RingSpecs() {
  return (
    <Section bg="muted">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-center">
        <RingImage className="rounded-lg border border-line" />
        <div>
          <SectionHead eyebrow="The ring" title="Titanium. 2.9 grams. Beautiful enough to forget." />
          <div className="grid grid-cols-2 gap-px rounded-card overflow-hidden border border-line mt-6">
            {SPECS.map(([label, value, unit]) => (
              <div key={label} className="bg-surface p-4.5">
                <div className="font-mono text-[0.68rem] tracking-[0.1em] uppercase text-muted">{label}</div>
                <div className="font-serif text-2xl font-medium mt-1.5 leading-[1.05]">
                  {value}
                  <small className="text-[0.8rem] text-muted font-sans"> {unit}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3.5 mt-6 flex-wrap">
            {FINISHES.map((finish) => (
              <div key={finish.id} className="flex items-center gap-2.5 text-[0.9rem] font-medium">
                <span
                  className="w-6.5 h-6.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.12),0_2px_6px_rgb(0_0_0_/_0.16)]"
                  style={{ background: finish.swatch }}
                />
                {finish.name}
              </div>
            ))}
          </div>
          <LinkButton href="/ring" variant="ghost" className="mt-6">
            Full specifications <Icon name="arrow" size={18} />
          </LinkButton>
        </div>
      </div>
    </Section>
  );
}
