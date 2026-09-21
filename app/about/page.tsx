import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { CTABand } from "@/components/ui/CTABand";
import { OurBelief } from "@/components/about/OurBelief";
import { TrustSection } from "@/components/about/TrustSection";
import { PromisesSection } from "@/components/about/PromisesSection";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `About — ${SITE.brand} by ${SITE.parent}`,
  description:
    "i do comes from Avataar — a dermatologist-led, at-home aesthetics brand trusted by 30,000+ women across 18+ Indian cities. We kept hearing the same thing: \"I want to understand my skin, not just track my steps.\" So we made it.",
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title="We built the ring we wished existed"
        lede={
          <>
            i do comes from Avataar — a dermatologist-led, at-home aesthetics brand trusted by
            30,000+ women across 18+ Indian cities. We kept hearing the same thing: &ldquo;I want
            to understand my skin, not just track my steps.&rdquo; So we made it.
          </>
        }
      />
      <OurBelief />
      <TrustSection />
      <PromisesSection />
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
    </>
  );
}
