import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { ContactCards } from "@/components/support/ContactCards";
import { ContactForm } from "@/components/support/ContactForm";
import { SupportFaqs } from "@/components/support/SupportFaqs";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Support — ${SITE.brand} by ${SITE.parent}`,
  description: "Reach the i do team by email, WhatsApp or phone, or find fast answers in our FAQ.",
};

export default function SupportPage() {
  return (
    <>
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "Support" }]}
        title="We're here to help"
        lede="Real people, quick replies. Reach us however you like — and find fast answers below."
      />
      <Section size="sm">
        <ContactCards />
      </Section>
      <Section size="sm">
        <SupportFaqs />
      </Section>
      <Section size="sm" bg="muted">
        <div className="max-w-[680px] mx-auto">
          <SectionHead center eyebrow="Still stuck?" title="Send us a message" />
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
