"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { useCart } from "@/lib/cart-context";

export function CartPageClient() {
  const { cart, cartSubtotal } = useCart();

  return (
    <div className="pt-11 pb-section">
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
        <h1 className="font-serif font-medium text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.03] tracking-[-0.01em] mb-8">
          Your bag
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-19 h-19 rounded-full bg-gold-tint text-gold-deep grid place-items-center mx-auto mb-5.5">
              <Icon name="cart" size={34} />
            </div>
            <h3 className="font-serif text-3xl font-medium mb-2">Your bag is empty</h3>
            <p className="text-muted mb-6">Find the finish and size that's right for you.</p>
            <LinkButton href="/shop">Shop the ring</LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-9 items-start">
            <div>
              {cart.map((item) => (
                <CartLineItem key={`${item.id}-${item.finish}-${item.size}`} item={item} />
              ))}
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-gold-deep font-semibold mt-5">
                <Icon name="chevron" size={14} className="rotate-180" /> Continue shopping
              </Link>
            </div>
            <OrderSummary subtotal={cartSubtotal} />
          </div>
        )}
      </Container>
    </div>
  );
}
