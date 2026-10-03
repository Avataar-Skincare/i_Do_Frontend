import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SITE, WHATSAPP_MESSAGE } from "@/lib/content/site";

const SHOP_LINKS: Array<[string, string]> = [
  ["/shop", "The ring"],
  ["/ring", "Technology"],
  ["/app", "The app"],
  ["/sizing", "Find my size"],
  ["/consults", "Consultations"],
];

const COMPANY_LINKS: Array<[string, string, boolean?]> = [
  ["/about", "About & Avataar"],
  ["/journal", "Journal"],
  [SITE.avataarUrl, "Avataar Skincare", true],
  ["/about", "On Shark Tank India"],
];

const SUPPORT_LINKS: Array<[string, string]> = [
  ["/account?tab=track", "Track order"],
  ["/support", "Help & FAQ"],
  ["/legal/returns", "Warranty & returns"],
  ["/legal/shipping", "Shipping"],
  ["/support", "Contact us"],
];

const PAYMENT_CHIPS = ["UPI", "RuPay", "Visa", "Mastercard", "COD", "Razorpay secured"];

export function Footer() {
  const waHref = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <footer className="bg-nav-2 text-[#C8BCA5] pt-16 pb-7.5">
      <div className="max-w-content mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 pb-11 border-b border-white/8">
          <div>
            <span className="font-serif italic text-2xl text-[#F5EEDD]">{SITE.brand}</span>
            <p className="text-sm text-[#9C9079] max-w-[34ch] leading-relaxed mt-4">
              The skin-first smart ring, from the dermatologist-led team at {SITE.parent}. Eight
              skin scores, cycle intelligence and a plan for your glow — no subscription, made for
              India.
            </p>
            <div className="flex gap-2.5 mt-4.5">
              <a
                href="#"
                aria-label="Instagram"
                className="w-[38px] h-[38px] rounded-full bg-white/6 grid place-items-center hover:bg-gold hover:text-white transition-colors"
              >
                <Icon name="ig" size={17} />
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="w-[38px] h-[38px] rounded-full bg-white/6 grid place-items-center hover:bg-gold hover:text-white transition-colors"
              >
                <Icon name="wa" size={17} />
              </a>
              <a
                href={`mailto:${SITE.email}`}
                aria-label="Email"
                className="w-[38px] h-[38px] rounded-full bg-white/6 grid place-items-center hover:bg-gold hover:text-white transition-colors"
              >
                <Icon name="mail" size={17} />
              </a>
            </div>
          </div>

          <FooterCol title="Shop" links={SHOP_LINKS} />
          <FooterCol title="Company" links={COMPANY_LINKS} />
          <FooterCol title="Support" links={SUPPORT_LINKS} />
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-6 text-[0.8rem] text-[#8A7E68]">
          <div>
            © {new Date().getFullYear()} {SITE.legalName} · {SITE.brand} by {SITE.parent}
            &nbsp;·&nbsp;
            <Link href="/legal/privacy" className="text-gold">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/legal/terms" className="text-gold">
              Terms
            </Link>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {PAYMENT_CHIPS.map((chip) => (
              <span
                key={chip}
                className="font-mono text-[0.66rem] tracking-[0.06em] bg-white/5 border border-white/8 py-1.5 px-2.5 rounded-md text-[#B4A88F]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string, boolean?]>;
}) {
  return (
    <div>
      <h5 className="font-mono text-[0.72rem] tracking-[0.16em] uppercase text-[#8A7E68] mb-4">
        {title}
      </h5>
      {links.map(([href, label, external], i) =>
        external ? (
          <a
            key={`${href}-${i}`}
            href={href}
            target="_blank"
            rel="noopener"
            className="block text-sm text-[#C0B49D] py-1.5 hover:text-gold-soft transition-colors"
          >
            {label}
          </a>
        ) : (
          <Link
            key={`${href}-${i}`}
            href={href}
            className="block text-sm text-[#C0B49D] py-1.5 hover:text-gold-soft transition-colors"
          >
            {label}
          </Link>
        )
      )}
    </div>
  );
}
