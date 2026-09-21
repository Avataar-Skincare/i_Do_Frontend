import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { BAG_PERKS } from "@/lib/content/cart";

export function OrderSummary({ subtotal }: { subtotal: number }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6.5 lg:sticky lg:top-[90px]">
      <h3 className="font-serif text-2xl font-medium mb-5">Order summary</h3>
      <div className="flex justify-between py-2 text-[0.94rem] text-ink-2">
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>
      <div className="flex justify-between py-2 text-[0.94rem] text-ink-2">
        <span>Shipping (prepaid)</span>
        <span className="text-sage font-semibold">Free</span>
      </div>
      <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-line font-semibold">
        <span>Total</span>
        <span className="font-serif text-[1.7rem] font-medium">{formatINR(subtotal)}</span>
      </div>
      <LinkButton href="/checkout" className="w-full mt-4.5" size="lg">
        Checkout <Icon name="arrow" size={18} />
      </LinkButton>
      <div className="flex flex-col gap-2.5 mt-5">
        {BAG_PERKS.map((perk) => (
          <div key={perk.text} className="flex items-center gap-2.5 text-[0.82rem] text-muted">
            <Icon name={perk.icon} size={15} className="text-sage shrink-0" />
            {perk.text}
          </div>
        ))}
      </div>
    </div>
  );
}
