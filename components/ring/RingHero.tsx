import { RingImage } from "@/components/ui/RingImage";
import { Container } from "@/components/ui/Container";
import { ESSENTIALS, RING_PHOTOS } from "@/lib/content/ring";

export function RingHero() {
  return (
    <div className="pb-section-sm">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-start mt-8">
          <RingImage
            src={RING_PHOTOS.wickerBackdrop}
            alt="i do smart ring, gold finish, on a woven backdrop"
            className="rounded-lg"
          />
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
              The essentials
            </div>
            <div className="grid grid-cols-2 gap-px rounded-card overflow-hidden border border-line">
              {ESSENTIALS.map((item) => (
                <div key={item.label} className="bg-surface p-4.5">
                  <div className="font-mono text-[0.68rem] tracking-[0.1em] uppercase text-muted">
                    {item.label}
                  </div>
                  <div className="font-serif text-2xl font-medium mt-1.5 leading-[1.05]">
                    {item.value}
                    <small className="text-[0.8rem] text-muted font-sans"> {item.unit}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
