import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { FINISHES } from "@/lib/content/product";

export function FinishesSection() {
  return (
    <Section>
      <SectionHead center eyebrow="Finishes" title="Three finishes. One quiet confidence." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-9">
        {FINISHES.map((finish) => {
          const photographed = finish.id === "gold";
          return (
            <div key={finish.id} className="bg-surface border border-line rounded-card p-7 text-center">
              <h3 className="text-xl font-semibold mb-1.5">{finish.name}</h3>
              <p className="text-muted mb-4">{finish.note}</p>
              {photographed ? (
                <span className="inline-flex items-center text-[0.7rem] font-semibold tracking-[0.06em] uppercase py-1.5 px-3 rounded-pill bg-gold-tint text-gold-deep">
                  Photographed
                </span>
              ) : (
                <span className="inline-flex items-center text-[0.85rem] py-1.5 px-3 rounded-pill border border-dashed border-line-2 text-muted">
                  Shown as swatch
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
