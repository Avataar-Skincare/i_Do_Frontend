import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Your Bag — ${SITE.brand} by ${SITE.parent}`,
};

export default function CartPage() {
  return <CartPageClient />;
}
