import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";

export function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  icon: IconName;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="text-center py-12 px-5 bg-surface border border-line rounded-lg">
      <div className="w-14 h-14 rounded-full bg-gold-tint text-gold-deep grid place-items-center mx-auto mb-4">
        <Icon name={icon} size={26} />
      </div>
      <h3 className="text-xl font-semibold mb-1.5">{title}</h3>
      <p className="text-muted mb-5">{body}</p>
      <LinkButton href={ctaHref}>{ctaLabel}</LinkButton>
    </div>
  );
}
