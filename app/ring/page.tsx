import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { CTABand } from "@/components/ui/CTABand";
import { RingHero } from "@/components/ring/RingHero";
import { SensorsSection } from "@/components/ring/SensorsSection";
import { BatterySection } from "@/components/ring/BatterySection";
import { FinishesSection } from "@/components/ring/FinishesSection";
import { SizingSection } from "@/components/ring/SizingSection";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `The Ring — ${SITE.brand} by ${SITE.parent}`,
  description:
    "Aerospace-grade titanium, medical-grade sensors and a week of battery — in 2.9 grams you'll stop noticing by lunch. This is the hardware behind your eight skin scores.",
};

export default function RingPage() {
  return (
    <>
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "The Ring" }]}
        title="Engineered to be worn, built to be forgotten"
        lede="Aerospace-grade titanium, medical-grade sensors and a week of battery — in 2.9 grams you'll stop noticing by lunch. This is the hardware behind your eight skin scores."
      />
      <RingHero />
      <SensorsSection />
      <BatterySection />
      <FinishesSection />
      <SizingSection />
      <CTABand
        title="Ready when you are."
        body="Titanium, a week of battery, and eight skin scores waiting for you."
        ctaLabel={`Shop the ring — ${formatINR(SITE.priceInPaise)}`}
        ctaHref="/shop"
      />
    </>
  );
}
