import { RingImage } from "@/components/ui/RingImage";
import { Container } from "@/components/ui/Container";
import { ABOUT_RING_PHOTO, BELIEF } from "@/lib/content/about";

export function OurBelief() {
  return (
    <div className="pb-section-sm">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11 items-center mt-8">
          <RingImage
            src={ABOUT_RING_PHOTO}
            alt="Two i do smart rings, gold finish"
            className="rounded-lg"
          />
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
              {BELIEF.eyebrow}
            </div>
            <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-4">
              {BELIEF.title}
            </h2>
            <div className="flex flex-col gap-4">
              {BELIEF.paragraphs.map((p) => (
                <p key={p} className="text-ink-2 max-w-[56ch] m-0">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
