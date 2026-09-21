import { Icon } from "@/components/ui/Icon";
import { SITE, WHATSAPP_MESSAGE } from "@/lib/content/site";

export function WhatsAppButton() {
  const href = `https://wa.me/${SITE.waNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed right-5 bottom-5 z-[55] w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-[0_12px_30px_-8px_rgb(37_211_102_/_0.6)] hover:scale-[1.06] transition-transform"
    >
      <Icon name="wa" size={30} />
    </a>
  );
}
