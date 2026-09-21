import { PhoneFrame } from "./PhoneFrame";
import { CIRCLE_SCREEN } from "@/lib/content/app-tab";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function PhoneCircle() {
  return (
    <PhoneFrame active="circle">
      <div className="text-[10px] font-semibold text-ink pt-1">The Circle</div>
      <div className="overflow-y-auto flex flex-col gap-2">
        {CIRCLE_SCREEN.articles.map((article) => (
          <div key={article.title} className="bg-surface border border-line rounded-lg overflow-hidden">
            <ImagePlaceholder label={article.tag} aspect="aspect-[16/9]" className="text-[6px]" />
            <div className="p-2">
              <span className="text-[5.5px] font-bold tracking-[0.05em] uppercase text-gold-deep">
                {article.tag}
              </span>
              <div className="text-[7.5px] font-semibold text-ink leading-snug mt-1">{article.title}</div>
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}
