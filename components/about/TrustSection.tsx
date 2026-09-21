import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { SITE } from "@/lib/content/site";

const STATS: Array<[string, string]> = [
  [SITE.customers, "Paying customers"],
  [`${SITE.rating}★`, "Average rating"],
  [SITE.cities, "Cities served"],
];

export function TrustSection() {
  return (
    <Section bg="nav">
      <SectionHead
        center
        dark
        eyebrow="The Avataar platform"
        title="A foundation of real trust"
        lede="i do stands on Avataar's track record in at-home aesthetics — and the same dermatologists now power your consults."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {STATS.map(([value, label]) => (
          <div key={label} className="bg-white/4 border border-white/10 rounded-card p-7 text-center">
            <div className="font-serif text-[2.6rem] text-gold-soft">{value}</div>
            <div className="text-[#B3A78F]">{label}</div>
          </div>
        ))}
      </div>
      <div className="text-center mt-7">
        <span className="inline-flex items-center gap-2.5 text-sm font-medium text-[#EDE4D3] bg-white/6 border border-white/10 rounded-pill py-3 px-5">
          <Icon name="award" size={17} className="text-gold-soft" /> As seen on Shark Tank India
        </span>
      </div>
    </Section>
  );
}
