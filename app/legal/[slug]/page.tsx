import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/ui/PageHead";
import { Container } from "@/components/ui/Container";
import { LEGAL_DOCS } from "@/lib/content/legal";
import { SITE } from "@/lib/content/site";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return {};
  return { title: `${doc.title} — ${SITE.brand} by ${SITE.parent}` };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) notFound();

  return (
    <div className="pb-section">
      <PageHead crumbs={[{ label: "Home", href: "/" }, { label: doc.title }]} title={doc.title} />
      <Container>
        <div className="max-w-[720px] mt-6 flex flex-col gap-4">
          {doc.blocks.map((block, i) => {
            if ("h2" in block) {
              return (
                <h2 key={i} className="font-serif font-medium text-2xl mt-4">
                  {block.h2}
                </h2>
              );
            }
            if ("ul" in block) {
              return (
                <ul key={i} className="pl-5 flex flex-col gap-2 text-ink-2">
                  {block.ul.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-ink-2 leading-relaxed">
                {block.p}
              </p>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
