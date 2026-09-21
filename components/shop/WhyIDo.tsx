import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { WHY_I_DO } from "@/lib/content/shop";

const TONE_CLASSES: Record<string, string> = {
  gold: "bg-gold-tint text-gold-deep",
  sage: "bg-sage-bg text-sage",
  plum: "bg-plum-bg text-plum",
};

export function WhyIDo() {
  return (
    <Section bg="muted">
      <SectionHead center eyebrow="Why i do" title="The whole ritual, in one ring" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 mt-10">
        {WHY_I_DO.map((item) => (
          <div key={item.title} className="bg-surface border border-line rounded-card p-7">
            <div className={`w-10 h-10 rounded-xl grid place-items-center mb-4.5 ${TONE_CLASSES[item.tone]}`}>
              <Icon name={item.icon} size={20} />
            </div>
            <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
            <p className="text-ink-2 text-[0.94rem] m-0">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
