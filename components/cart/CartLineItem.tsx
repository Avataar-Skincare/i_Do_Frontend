"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { formatINR } from "@/lib/format";
import { useCart, type CartItem } from "@/lib/cart-context";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQty, removeItem } = useCart();
  const meta = [item.finish, item.size && `US ${item.size}`].filter(Boolean).join(" · ");

  return (
    <div className="flex gap-4.5 py-5.5 border-b border-line first:border-t">
      <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-line bg-surface-2">
        <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[1.05rem] font-semibold mb-1">{item.name}</h4>
        {meta && <p className="text-[0.85rem] text-muted mb-3">{meta}</p>}
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center border-[1.5px] border-line-2 rounded-pill overflow-hidden">
              <button
                onClick={() => updateQty(item.id, item.finish, item.size, item.qty - 1)}
                className="w-9 h-9 grid place-items-center hover:bg-bg-3"
              >
                −
              </button>
              <span className="min-w-8 text-center font-semibold text-sm">{item.qty}</span>
              <button
                onClick={() => updateQty(item.id, item.finish, item.size, item.qty + 1)}
                className="w-9 h-9 grid place-items-center hover:bg-bg-3"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.id, item.finish, item.size)}
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-muted hover:text-[color:var(--color-error)]"
            >
              <Icon name="close" size={13} /> Remove
            </button>
          </div>
          <span className="font-serif text-[1.35rem] font-medium">{formatINR(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  );
}
