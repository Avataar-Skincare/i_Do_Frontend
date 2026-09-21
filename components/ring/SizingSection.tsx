import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { SIZES } from "@/lib/content/product";

const mm = (value: number) => `${Number(value.toFixed(1))} mm`;

export function SizingSection() {
  return (
    <Section bg="muted">
      <SectionHead center eyebrow="Sizing" title="Find your fit" />
      <div className="max-w-2xl mx-auto mt-9 bg-surface border border-line rounded-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["US size", "Circumference", "Inner Ø", "Outer Ø"].map((h) => (
                <th
                  key={h}
                  className="font-mono text-[0.68rem] tracking-[0.08em] uppercase text-muted font-medium text-center py-4 px-2.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size) => (
              <tr key={size.us} className="border-t border-line">
                <td className="text-center font-semibold py-3 px-2.5">{size.us}</td>
                <td className="text-center py-3 px-2.5">{mm(size.circ)}</td>
                <td className="text-center py-3 px-2.5">{mm(size.id)}</td>
                <td className="text-center py-3 px-2.5">{mm(size.od)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 justify-center flex-wrap mt-7">
        <LinkButton href="/sizing" variant="dark">
          <Icon name="search" size={16} /> Size calculator
        </LinkButton>
        <LinkButton href="/sizing" variant="ghost">
          Order a free sizing kit
        </LinkButton>
      </div>
    </Section>
  );
}
