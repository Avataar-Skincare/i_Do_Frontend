import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { CTABand } from "@/components/ui/CTABand";
import { AppHero } from "@/components/app-tab/AppHero";
import { InsideAppSection } from "@/components/app-tab/InsideAppSection";
import { AppFeaturesGrid } from "@/components/app-tab/AppFeaturesGrid";
import { LunaSection } from "@/components/app-tab/LunaSection";
import { AvailabilitySection } from "@/components/app-tab/AvailabilitySection";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `The App — ${SITE.brand} by ${SITE.parent}`,
  description:
    "Your ring gathers the data. The i do app — with Luna, your AI skin coach — turns it into eight scores and a plan you can actually follow, every single morning.",
};

export default function AppPage() {
  return (
    <>
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "The App" }]}
        title="The app that turns signals into a glow-up"
        lede="Your ring gathers the data. The i do app — with Luna, your AI skin coach — turns it into eight scores and a plan you can actually follow, every single morning."
      />
      <AppHero />
      <InsideAppSection />
      <AppFeaturesGrid />
      <LunaSection />
      <AvailabilitySection />
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
