import type { AuthUser } from "@/lib/auth-context";
import type { Order } from "@/lib/orders-storage";
import type { StoredConsult } from "@/lib/consults-storage";
import { orderStageLabel } from "@/lib/order-status";
import { OrderCard } from "./OrderCard";
import { EmptyState } from "./EmptyState";
import { DeleteAccountSection } from "./DeleteAccountSection";

export function OverviewTab({ user, orders, consults }: { user: AuthUser; orders: Order[]; consults: StoredConsult[] }) {
  const firstName = (user.fullName || user.email?.split("@")[0] || user.phone || "there").split(" ")[0];
  const latest = orders[0];

  return (
    <div>
      <div className="bg-gradient-to-br from-gold-tint to-bg-2 border border-gold-wash rounded-lg p-6 mb-6">
        <h2 className="font-serif font-medium text-2xl">Hi {firstName} 🤍</h2>
        <p className="text-ink-2 mt-1">Here&rsquo;s everything in one place — orders, consults and your ring journey.</p>
      </div>

      <div className="grid grid-cols-3 gap-3.5 mb-6">
        <Stat value={orders.length} label="Orders" />
        <Stat value={consults.length} label="Consults booked" />
        <Stat value={latest ? orderStageLabel(latest).split(" ")[0] : "—"} label="Ring status" />
      </div>

      {latest ? (
        <>
          <h3 className="text-lg font-semibold mb-3">Latest order</h3>
          <OrderCard order={latest} />
        </>
      ) : (
        <EmptyState
          icon="box"
          title="No orders yet"
          body="Your ring journey starts here."
          ctaLabel="Shop the ring"
          ctaHref="/shop"
        />
      )}

      <DeleteAccountSection />
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <div className="font-serif text-3xl font-medium">{value}</div>
      <div className="text-[0.82rem] text-muted mt-0.5">{label}</div>
    </div>
  );
}
