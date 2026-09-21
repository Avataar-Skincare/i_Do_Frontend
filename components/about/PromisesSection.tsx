import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { PROMISES } from "@/lib/content/about";
import { SITE } from "@/lib/content/site";

export function PromisesSection() {
  return (
    <Section>
      <SectionHead center eyebrow="What we stand for" title="Four promises we keep" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-10">
        {PROMISES.map((promise) => (
          <div key={promise.title} className="bg-surface border border-line rounded-card p-6 flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-tint text-gold-deep grid place-items-center">
              <Icon name={promise.icon} size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1">{promise.title}</h4>
              <p className="text-ink-2 text-[0.94rem] m-0">{promise.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center flex-wrap mt-8">
        <LinkButton href="/shop">Shop the ring</LinkButton>
        <LinkButton href={SITE.avataarUrl} variant="ghost" target="_blank" rel="noopener">
          Visit Avataar Skincare
        </LinkButton>
      </div>
    </Section>
  );
}
