import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { FAQS } from "@/lib/content/home";

export function FAQSection() {
  return (
    <Section size="sm">
      <SectionHead center eyebrow="Good to know" title="Questions, answered" />
      <div className="mt-8">
        <FaqAccordion faqs={FAQS.slice(0, 6)} />
      </div>
      <div className="text-center mt-6">
        <Link
          href="/support"
          className="text-gold-deep font-semibold border-b-[1.5px] border-gold/45 hover:border-gold pb-px"
        >
          See all FAQs &amp; support
        </Link>
      </div>
    </Section>
  );
}
