import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Checkout — ${SITE.brand} by ${SITE.parent}`,
};

export default function CheckoutPage() {
  return (
    <div className="pt-11 pb-section">
      <Container>
        <Breadcrumb items={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="font-serif font-medium text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.03] tracking-[-0.01em] mb-8">
          Checkout
        </h1>
        <CheckoutForm />
      </Container>
    </div>
  );
}
