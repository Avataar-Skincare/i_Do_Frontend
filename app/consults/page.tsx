import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Container } from "@/components/ui/Container";
import { ConsultBooking } from "@/components/consults/ConsultBooking";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Consultations — ${SITE.brand} by ${SITE.parent}`,
  description:
    "Every i do ring includes a session with an Avataar dermatologist and a dietician. An app should know when to hand you to a human — this is that moment.",
};

export default function ConsultsPage() {
  return (
    <div className="pb-section">
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "Consultations" }]}
        title="Two free consults, built around your scores"
        lede="Every i do ring includes a session with an Avataar dermatologist and a dietician. An app should know when to hand you to a human — this is that moment."
      />
      <Container>
        <div className="mt-8">
          <ConsultBooking />
        </div>
      </Container>
    </div>
  );
}
