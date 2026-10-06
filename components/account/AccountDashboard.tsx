"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { getMyOrders, type Order } from "@/lib/orders-storage";
import { getMyConsults, type StoredConsult } from "@/lib/consults-storage";
import { OverviewTab } from "./OverviewTab";
import { OrdersTab } from "./OrdersTab";
import { ConsultsTab } from "./ConsultsTab";
import { TrackTab } from "./TrackTab";
import { VerifyEmailBanner } from "./VerifyEmailBanner";

type Tab = "overview" | "orders" | "consults" | "track";

const TABS: Tab[] = ["overview", "orders", "consults", "track"];

const NAV: Array<{ id: Tab; label: string; icon: "user" | "box" | "face" | "truck" }> = [
  { id: "overview", label: "Overview", icon: "user" },
  { id: "orders", label: "Orders", icon: "box" },
  { id: "consults", label: "Consults", icon: "face" },
  { id: "track", label: "Track", icon: "truck" },
];

export function AccountDashboard() {
  const { user, logout } = useAuth();
  const requestedTab = useSearchParams().get("tab");
  const initialTab = TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [consults, setConsults] = useState<StoredConsult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyOrders(), getMyConsults()])
      .then(([o, c]) => {
        setOrders(o);
        setConsults(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="font-serif font-medium text-3xl mb-6">Your account</h1>
      <VerifyEmailBanner />
      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-[90px] lg:self-start">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={[
                "flex items-center gap-2.5 text-left py-3 px-4 rounded-sm font-medium whitespace-nowrap transition-colors",
                tab === item.id ? "bg-nav text-white" : "text-ink-2 hover:bg-surface",
              ].join(" ")}
            >
              <Icon name={item.icon} size={18} /> {item.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-2.5 text-left py-3 px-4 rounded-sm font-medium whitespace-nowrap text-ink-2 hover:bg-surface transition-colors"
          >
            <Icon name="close" size={18} /> Log out
          </button>
        </nav>

        <div>
          {loading ? (
            <div className="text-center py-16 text-muted">Loading…</div>
          ) : (
            <>
              {tab === "overview" && <OverviewTab user={user} orders={orders} consults={consults} />}
              {tab === "orders" && <OrdersTab orders={orders} />}
              {tab === "consults" && <ConsultsTab consults={consults} />}
              {tab === "track" && <TrackTab orders={orders} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
