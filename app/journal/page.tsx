import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Container } from "@/components/ui/Container";
import { Newsletter } from "@/components/home/Newsletter";
import { JournalCard } from "@/components/journal/JournalCard";
import { JOURNAL_ARTICLES } from "@/lib/content/journal";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Journal — ${SITE.brand} by ${SITE.parent}`,
  description:
    "Skin-first science, cycle-aware routines and glow-friendly food — in plain language, from the Avataar team.",
};

export default function JournalPage() {
  return (
    <div className="pb-section">
      <PageHead
        crumbs={[{ label: "Home", href: "/" }, { label: "Journal" }]}
        title="The i do Journal"
        lede="Skin-first science, cycle-aware routines and glow-friendly food — in plain language, from the Avataar team."
      />
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {JOURNAL_ARTICLES.map((article) => (
            <JournalCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
      <Newsletter />
    </div>
  );
}
