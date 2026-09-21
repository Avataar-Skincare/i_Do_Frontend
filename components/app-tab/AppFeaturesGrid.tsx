import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { APP_FEATURES } from "@/lib/content/home";

export function AppFeaturesGrid() {
  return (
    <Section bg="muted">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {APP_FEATURES.map((feat) => (
          <div key={feat.title} className="bg-surface border border-line rounded-card p-6 flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-tint text-gold-deep grid place-items-center">
              <Icon name={feat.icon} size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold mb-1">{feat.title}</h4>
              <p className="text-ink-2 text-[0.94rem] m-0">{feat.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
