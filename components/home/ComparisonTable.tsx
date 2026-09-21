import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { COMPARE } from "@/lib/content/home";
import { SITE } from "@/lib/content/site";

function Cell({ value, isUs }: { value: string; isUs: boolean }) {
  const base = "py-4 px-4.5 border-b border-line text-[0.92rem]";
  const usBg = isUs ? "bg-[color-mix(in_srgb,var(--color-gold-tint)_55%,transparent)] font-semibold" : "";
  if (value === "yes") {
    return (
      <td className={`${base} ${usBg} text-sage font-semibold`}>
        <Icon name="check" size={18} />
      </td>
    );
  }
  if (value === "no") {
    return <td className={`${base} ${usBg} text-faint`}>—</td>;
  }
  if (value === "partial") {
    return (
      <td className={`${base} ${usBg}`}>
        <span className="text-muted">Partial</span>
      </td>
    );
  }
  return <td className={`${base} ${usBg}`}>{value}</td>;
}

export function ComparisonTable() {
  return (
    <Section>
      <SectionHead
        center
        eyebrow="How we compare"
        title="Made for your skin, not just your steps"
        lede="Other smart rings are brilliant at fitness. i do is built, first and last, around your skin — with no subscription to unlock it."
      />
      <div className="overflow-x-auto rounded-card border border-line shadow-sm mt-9">
        <table className="w-full border-collapse min-w-[640px] bg-surface">
          <thead>
            <tr>
              <th className="bg-bg-2 font-semibold text-[0.86rem] text-left py-4 px-4.5 border-b border-line">
                Feature
              </th>
              <th className="bg-gold-tint text-gold-deep font-semibold text-[0.86rem] text-left py-4 px-4.5 border-b border-line">
                {SITE.brand}
              </th>
              {COMPARE.cols.map((col) => (
                <th key={col} className="bg-bg-2 font-semibold text-[0.86rem] text-left py-4 px-4.5 border-b border-line">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.rows.map((row) => (
              <tr key={row[0]}>
                <td className="py-4 px-4.5 border-b border-line text-[0.92rem] text-muted font-medium">{row[0]}</td>
                <Cell value={row[1]} isUs />
                <Cell value={row[2]} isUs={false} />
                <Cell value={row[3]} isUs={false} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.78rem] text-muted mt-3">
        * Competitor prices are indicative starting points for comparable ring models and may
        vary; product names are trademarks of their respective owners. Comparison reflects
        skin-focused features as of {new Date().getFullYear()}.
      </p>
    </Section>
  );
}
