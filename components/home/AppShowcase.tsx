import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { APP_FEATURES } from "@/lib/content/home";
import { APP_SCREENSHOTS } from "@/lib/content/app-screenshots";

export function AppShowcase() {
  return (
    <Section bg="muted">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center">
          <PhoneScreenshot
            src={APP_SCREENSHOTS[0]}
            alt="The i do app home screen showing today's Glow score"
            caption="Home · your Glow score & today's plan"
          />
        </div>
        <div>
          <SectionHead eyebrow="The app" title="A daily plan, not just a dashboard" />
          <p className="text-[1.14rem] leading-[1.65] text-ink-2 max-w-[60ch] mb-2">
            Numbers are only half of it. Luna, your AI skin coach, turns your scores into what to
            actually do today — skincare, food and movement.
          </p>
          <div className="flex flex-col gap-2 mt-5.5">
            {APP_FEATURES.slice(0, 4).map((feat) => (
              <div key={feat.title} className="flex gap-3.5 p-3.5 rounded-sm hover:bg-surface transition-colors">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-tint text-gold-deep grid place-items-center">
                  <Icon name={feat.icon} size={20} />
                </div>
                <div>
                  <h4 className="text-base mb-0.5">{feat.title}</h4>
                  <p className="text-[0.9rem] text-muted m-0">{feat.body}</p>
                </div>
              </div>
            ))}
          </div>
          <LinkButton href="/app" variant="dark" className="mt-4.5">
            Explore the app <Icon name="arrow" size={18} />
          </LinkButton>
        </div>
      </div>
      <div className="flex gap-4.5 overflow-x-auto pt-2.5 pb-5.5 mt-11 snap-x snap-mandatory">
        <PhoneScreenshot
          src={APP_SCREENSHOTS[1]}
          alt="The i do app's eight skin scores screen"
          caption="Eight skin scores"
          className="shrink-0 w-[250px] snap-center"
        />
        <PhoneScreenshot
          src={APP_SCREENSHOTS[2]}
          alt="The i do app's daily routine screen"
          caption="Your routine, kept"
          className="shrink-0 w-[250px] snap-center"
        />
        <PhoneScreenshot
          src={APP_SCREENSHOTS[3]}
          alt="The i do app's food/plate screen"
          caption="Eat for your glow"
          className="shrink-0 w-[250px] snap-center"
        />
        <PhoneScreenshot
          src={APP_SCREENSHOTS[4]}
          alt="The i do app's Circle content screen"
          caption="The Circle"
          className="shrink-0 w-[250px] snap-center"
        />
      </div>
    </Section>
  );
}
