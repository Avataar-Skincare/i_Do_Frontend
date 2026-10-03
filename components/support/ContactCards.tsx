import { Icon } from "@/components/ui/Icon";
import { SITE, WHATSAPP_MESSAGE } from "@/lib/content/site";

export function ContactCards() {
  const waHref = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card icon="mail" title="Email us" body="We reply within 24 hours" href={`mailto:${SITE.email}`} label={SITE.email} />
      <Card icon="wa" title="WhatsApp" body="Fastest for order help" href={waHref} label="Chat with us" external />
      <Card
        icon="phone"
        title="Call us"
        body="Mon–Sat, 10am–7pm"
        href={`tel:${SITE.phone.replace(/\s/g, "")}`}
        label={SITE.phone}
      />
    </div>
  );
}

function Card({
  icon,
  title,
  body,
  href,
  label,
  external,
}: {
  icon: "mail" | "wa" | "phone";
  title: string;
  body: string;
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <div className="bg-surface border border-line rounded-card p-6.5 text-center">
      <div className="w-11 h-11 rounded-full bg-gold-tint text-gold-deep grid place-items-center mx-auto mb-4">
        <Icon name={icon} size={20} />
      </div>
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-muted text-[0.9rem] mb-3">{body}</p>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
        className="text-gold-deep font-semibold"
      >
        {label}
      </a>
    </div>
  );
}
