import { Icon } from "@/components/ui/Icon";
import { RingImage } from "@/components/ui/RingImage";
import { Section } from "@/components/ui/Section";
import { BATTERY_FEATURES, RING_PHOTOS } from "@/lib/content/ring";

export function BatterySection() {
  return (
    <Section bg="muted">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-11 items-center">
        <div>
          <div className="font-mono text-xs tracking-[0.2em] uppercase text-gold-deep mb-4">
            Battery &amp; water
          </div>
          <h2 className="font-serif font-medium text-[clamp(2rem,4.4vw,3.15rem)] leading-[1.05] tracking-[-0.01em] mb-3.5">
            A week between charges.
            <br />
            Fine in the shower.
          </h2>
          <p className="text-ink-2 max-w-[60ch] mb-6">
            Most smart rings ask for a charge every couple of days. i do runs 4–7 days on a charge
            and tops up in about an hour on its magnetic dock — so it&rsquo;s on your finger when
            the readings matter: overnight.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
            {BATTERY_FEATURES.map((feat) => (
              <div key={feat.text} className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gold-tint text-gold-deep grid place-items-center shrink-0">
                  <Icon name={feat.icon} size={16} />
                </span>
                <span className="text-[0.94rem]">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
        <RingImage
          src={RING_PHOTOS.onBoxEdge}
          alt="i do smart ring, gold finish, resting on a box edge"
          className="rounded-lg"
        />
      </div>
    </Section>
  );
}
