import { SectionHead } from "@/components/ui/SectionHead";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { FAQS } from "@/lib/content/home";

export function SupportFaqs() {
  return (
    <>
      <SectionHead center eyebrow="FAQ" title="Answers to the common questions" />
      <div className="mt-8">
        <FaqAccordion faqs={FAQS} />
      </div>
    </>
  );
}
