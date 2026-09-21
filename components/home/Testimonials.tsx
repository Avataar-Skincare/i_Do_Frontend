import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { REVIEWS } from "@/lib/content/home";

export function Testimonials() {
  return (
    <Section>
      <SectionHead center eyebrow="Early community" title="Women are already glowing with i do" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 mt-9">
        {REVIEWS.slice(0, 3).map((review) => (
          <div key={review.name} className="bg-surface border border-line rounded-card p-6.5">
            <div className="flex gap-0.5 text-gold mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={14} className={i < review.stars ? "" : "opacity-25"} />
              ))}
            </div>
            <p className="font-serif text-[1.24rem] leading-[1.4] text-ink mb-4">&ldquo;{review.text}&rdquo;</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9.5 h-9.5 rounded-full bg-gold-tint text-gold-deep grid place-items-center font-bold text-sm">
                {review.name[0]}
              </div>
              <div>
                <div className="font-semibold text-sm">{review.name}</div>
                <div className="text-[0.78rem] text-muted">{review.loc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-6">
        <span className="inline-flex items-center gap-2 text-[0.74rem] text-muted border border-dashed border-line-2 py-1.5 px-3.5 rounded-pill">
          <Icon name="info" size={14} /> Illustrative reviews shown for this preview site
        </span>
      </div>
    </Section>
  );
}
