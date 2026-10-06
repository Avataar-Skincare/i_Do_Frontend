import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { Note } from "@/components/ui/Note";
import { Icon } from "@/components/ui/Icon";
import { JournalCard } from "@/components/journal/JournalCard";
import { JOURNAL_ARTICLES } from "@/lib/content/journal";
import { SITE } from "@/lib/content/site";

export function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} — ${SITE.brand} by ${SITE.parent}`,
    description: article.dek,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const others = JOURNAL_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="pb-section">
      <Section size="sm">
        <Breadcrumb items={[{ label: "Journal", href: "/journal" }, { label: article.tag }]} />
        <div className="font-mono text-xs tracking-[0.08em] uppercase text-gold-deep mb-3">
          {article.tag} · {article.read} read
        </div>
        <h1 className="font-serif font-medium text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] tracking-[-0.01em] mb-6 max-w-[46ch]">
          {article.title}
        </h1>
        <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-gold-tint to-bg-3 rounded-lg mb-8">
          <span className="font-serif text-5xl text-gold-soft/70 select-none">{article.glyphWord}</span>
        </div>
        <div className="max-w-[68ch] flex flex-col gap-4">
          {article.body.map((block, i) =>
            "h" in block ? (
              <h3 key={i} className="font-serif font-medium text-xl mt-2">
                {block.h}
              </h3>
            ) : (
              <p key={i} className="text-ink-2 leading-relaxed">
                {block.p}
              </p>
            )
          )}
        </div>
        <div className="max-w-[68ch] mt-7">
          <Note tone="sage">
            Educational content, not medical advice. i do supports your choices — it
            doesn&rsquo;t diagnose or treat. For concerns, see a qualified professional.
          </Note>
        </div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 mt-6 text-gold-deep font-medium hover:underline"
        >
          <Icon name="chevron" size={14} className="rotate-180" /> Back to the Journal
        </Link>
      </Section>
      <Section size="sm" bg="muted">
        <SectionHead eyebrow="Keep reading" title="More from the Journal" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-7">
          {others.map((a) => (
            <JournalCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>
    </div>
  );
}
