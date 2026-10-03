import Link from "next/link";
import type { Article } from "@/lib/content/journal";

export function JournalCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/journal/${article.slug}`}
      className="group block bg-surface border border-line rounded-lg overflow-hidden hover:border-gold transition-colors"
    >
      <div className="aspect-[16/10] relative flex items-center justify-center bg-gradient-to-br from-gold-tint to-bg-3">
        <span className="absolute top-3 left-3 font-mono text-[0.68rem] tracking-[0.08em] uppercase bg-surface/90 text-gold-deep rounded-pill py-1 px-2.5">
          {article.tag}
        </span>
        <span className="font-serif text-3xl text-gold-soft/70 select-none">{article.glyphWord}</span>
      </div>
      <div className="p-5">
        <h4 className="text-lg font-semibold mb-1.5 group-hover:text-gold-deep transition-colors">
          {article.title}
        </h4>
        <p className="text-ink-2 text-[0.94rem] m-0 mb-3">{article.dek}</p>
        <div className="font-mono text-[0.72rem] tracking-[0.06em] uppercase text-muted">
          {article.tag} · {article.read} read
        </div>
      </div>
    </Link>
  );
}
