import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/content/site";

const STATS: Array<[string, string]> = [
  [SITE.customers, "Paying customers"],
  [`${SITE.rating}★`, "Average rating"],
  [SITE.cities, "Indian cities"],
  ["2", "Free consults / ring"],
];

export function BackedByAvataar() {
  return (
    <Section bg="nav">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-soft mb-4">
            Backed by {SITE.parent}
          </div>
          <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-3.5 text-[#F5EEDD]">
            Built by a dermatologist-led team India already trusts
          </h2>
          <p className="text-[#B3A78F] text-[1.05rem]">
            {SITE.brand} comes from {SITE.parent} — the at-home aesthetics brand with{" "}
            {SITE.customers} customers across {SITE.cities} cities, a {SITE.rating}★ rating, and a
            spot on Shark Tank India. Every ring includes a free consult with an {SITE.parent}{" "}
            dermatologist and a dietician.
          </p>
          <div className="flex gap-3 mt-6 flex-wrap">
            <LinkButton href="/about">Our story</LinkButton>
            <LinkButton href="/consults" variant="ghost-invert">
              Free consults
            </LinkButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          {STATS.map(([value, label]) => (
            <div key={label} className="bg-white/4 border border-white/10 rounded-card p-5.5">
              <div className="font-serif text-[2.4rem] text-gold-soft">{value}</div>
              <div className="text-[#B3A78F] text-[0.85rem]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
