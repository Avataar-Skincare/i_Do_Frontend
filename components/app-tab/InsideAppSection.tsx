import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { PHONE_CAPTIONS } from "@/lib/content/app-tab";
import { PhoneHome } from "./PhoneHome";
import { PhoneScores } from "./PhoneScores";
import { PhoneRoutine } from "./PhoneRoutine";
import { PhonePlate } from "./PhonePlate";
import { PhoneCircle } from "./PhoneCircle";

export function InsideAppSection() {
  const phones = [<PhoneHome key="home" />, <PhoneScores key="scores" />, <PhoneRoutine key="routine" />, <PhonePlate key="plate" />, <PhoneCircle key="circle" />];

  return (
    <Section>
      <SectionHead center eyebrow="Inside the app" title="Five spaces, one ritual" />
      <div className="flex gap-4.5 overflow-x-auto pt-8 pb-2 mt-2 snap-x snap-mandatory">
        {phones.map((phone, i) => (
          <figure key={i} className="shrink-0 w-[240px] snap-center m-0">
            {phone}
            <figcaption className="text-center mt-3.5 text-[0.82rem] text-muted font-mono tracking-[0.04em]">
              {PHONE_CAPTIONS[i]}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
