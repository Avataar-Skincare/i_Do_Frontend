import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { STEPS } from "@/lib/content/home";

export function HowItWorks() {
  return (
    <Section>
      <SectionHead center eyebrow="How it works" title="Glow, in three quiet steps" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5.5 mt-10">
        {STEPS.map((step, i) => (
          <div key={step.title} className="bg-surface border border-line rounded-card p-7.5 pt-7.5">
            <div className="flex items-center gap-2.5 font-serif text-lg text-gold-deep font-semibold mb-3.5">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span className="h-px flex-1 bg-line-2" />
            </div>
            <h4 className="font-serif font-medium text-2xl mb-2">{step.title}</h4>
            <p className="text-ink-2 text-[0.94rem] m-0">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
