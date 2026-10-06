import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { PHONE_CAPTIONS } from "@/lib/content/app-tab";
import { APP_SCREENSHOTS } from "@/lib/content/app-screenshots";

export function InsideAppSection() {
  return (
    <Section>
      <SectionHead center eyebrow="Inside the app" title="Five spaces, one ritual" />
      <div className="flex gap-4.5 overflow-x-auto pt-8 pb-2 mt-2 snap-x snap-mandatory">
        {APP_SCREENSHOTS.map((src, i) => (
          <PhoneScreenshot
            key={src}
            src={src}
            alt={PHONE_CAPTIONS[i]}
            caption={PHONE_CAPTIONS[i]}
            className="shrink-0 w-[240px] snap-center"
          />
        ))}
      </div>
    </Section>
  );
}
