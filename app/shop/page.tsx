import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { CTABand } from "@/components/ui/CTABand";
import { Gallery } from "@/components/shop/Gallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { WhyIDo } from "@/components/shop/WhyIDo";
import { PRODUCT } from "@/lib/content/shop";
import { formatINR } from "@/lib/format";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `${PRODUCT.name} — ${SITE.brand} by ${SITE.parent}`,
  description: PRODUCT.tagline,
};

export default function ShopPage() {
  return (
    <>
      <div className="pt-11 pb-2.5">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        </Container>
      </div>
      <div className="pb-section-sm">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-start pt-5.5">
            <Gallery />
            <ProductInfo />
          </div>
        </Container>
      </div>
      <WhyIDo />
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
