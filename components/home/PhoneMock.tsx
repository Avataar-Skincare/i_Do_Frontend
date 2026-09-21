import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

/** Stands in for the prototype's phone-frame app screenshots (base64 placeholders). */
export function PhoneMock({ caption, className }: { caption: string; className?: string }) {
  return (
    <figure className={["m-0 w-full max-w-[300px]", className].filter(Boolean).join(" ")}>
      <div className="relative rounded-[38px] bg-nav p-2.5 shadow-lg">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-9 h-1.5 rounded-full bg-white/14" />
        <ImagePlaceholder label={caption} className="rounded-[30px] aspect-[9/19]" />
      </div>
      <figcaption className="text-center mt-3.5 text-[0.82rem] text-muted font-mono tracking-[0.04em]">
        {caption}
      </figcaption>
    </figure>
  );
}
