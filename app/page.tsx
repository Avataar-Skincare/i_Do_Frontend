import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ScoresSection } from "@/components/home/ScoresSection";
import { CycleBanner } from "@/components/home/CycleBanner";
import { AppShowcase } from "@/components/home/AppShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RingSpecs } from "@/components/home/RingSpecs";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { BackedByAvataar } from "@/components/home/BackedByAvataar";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";
import { CTABand } from "@/components/ui/CTABand";
import { Newsletter } from "@/components/home/Newsletter";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ScoresSection />
      <CycleBanner />
      <AppShowcase />
      <HowItWorks />
      <RingSpecs />
      <ComparisonTable />
      <BackedByAvataar />
      <Testimonials />
      <FAQSection />
      <CTABand
        eyebrow="Say it to yourself"
        title={
          <>
            The one promise that pays you back: <em className="italic text-gold-soft">i do</em>.
          </>
        }
        body="A daily commitment to your skin, your body and your glow — decoded by the ring, guided by the app, backed by real dermatologists."
        ctaLabel={`Shop the ring — ${formatINR(SITE.priceInPaise)}`}
        ctaHref="/shop"
        secondaryLabel="Explore the app"
        secondaryHref="/app"
      />
      <Newsletter />
    </>
  );
}
