import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Container } from "@/components/ui/Container";
import { SizeCalculator } from "@/components/sizing/SizeCalculator";
import { SizeChart } from "@/components/sizing/SizeChart";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Sizing — ${SITE.brand} by ${SITE.parent}`,
  description:
    "Measure the finger you'll wear it on, pop the number in below, and we'll match you to a US size. Prefer to try first? Order a free sizing kit and fit the real widths at home.",
};

export default function SizingPage() {
  return (
    <div className="pb-section">
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "Sizing" }]}
        title="Find your ring size in seconds"
        lede="Measure the finger you'll wear it on, pop the number in below, and we'll match you to a US size. Prefer to try first? Order a free sizing kit and fit the real widths at home."
      />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 items-start mt-8">
          <SizeCalculator />
          <SizeChart />
        </div>
      </Container>
    </div>
  );
}
