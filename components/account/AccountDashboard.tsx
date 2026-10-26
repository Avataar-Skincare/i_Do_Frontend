"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { getMyOrders, type Order } from "@/lib/orders-storage";
import { getMyConsults, type StoredConsult } from "@/lib/consults-storage";
import { OverviewTab } from "./OverviewTab";
import { OrdersTab } from "./OrdersTab";
import { ConsultsTab } from "./ConsultsTab";
import { TrackTab } from "./TrackTab";

type Tab = "overview" | "orders" | "consults" | "track";

const TABS: Tab[] = ["overview", "orders", "consults", "track"];

const NAV: Array<{ id: Tab; label: string; icon: "user" | "box" | "face" | "truck" }> = [
  { id: "overview", label: "Overview", icon: "user" },
  { id: "orders", label: "Orders", icon: "box" },
  { id: "consults", label: "Consults", icon: "face" },
  { id: "track", label: "Track", icon: "truck" },
];

/** One list from the API: still loading, here, or failed (kept apart so one failing never hides the other). */
type Load<T> = { state: "loading" } | { state: "ready"; data: T } | { state: "error"; error: unknown };

function useList<T>(fetcher: () => Promise<T[]>): [Load<T[]>, () => void, (next: (prev: T[]) => T[]) => void] {
  const [load, setLoad] = useState<Load<T[]>>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    fetcher().then(
      (data) => live && setLoad({ state: "ready", data }),
      (error) => live && setLoad({ state: "error", error }),
    );
    return () => {
      live = false;
    };
  }, [fetcher, attempt]);

  const retry = useCallback(() => {
    setLoad({ state: "loading" });
    setAttempt((n) => n + 1);
  }, []);
  const update = useCallback(
    (next: (prev: T[]) => T[]) => setLoad((l) => (l.state === "ready" ? { state: "ready", data: next(l.data) } : l)),
    [],
  );
  return [load, retry, update];
}

function LoadError({ what, error, onRetry, onLogin }: { what: string; error: unknown; onRetry: () => void; onLogin: () => void }) {
  const expired = error instanceof ApiError && error.status === 401;
  return (
    <div role="alert" className="text-center py-12 px-5 bg-surface border border-line rounded-lg">
      <h3 className="text-xl font-semibold mb-1.5">{expired ? "Your session has expired" : `We couldn't load ${what}`}</h3>
      <p className="text-muted mb-5">
        {expired ? "Please log in again to see your account." : "Check your connection and try again. If it keeps happening, contact support."}
      </p>
      <button
        type="button"
        onClick={expired ? onLogin : onRetry}
        className="bg-nav text-white font-semibold py-3 px-7 rounded-pill hover:opacity-90 transition-opacity"
      >
        {expired ? "Log in again" : "Try again"}
      </button>
    </div>
  );
}

export function AccountDashboard() {
  const { user, logout } = useAuth();
  const requestedTab = useSearchParams().get("tab");
  const initialTab = TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [ordersLoad, retryOrders, updateOrders] = useList<Order>(getMyOrders);
  const [consultsLoad, retryConsults] = useList<StoredConsult>(getMyConsults);

  // Swap one order for its fresh copy (e.g. after the size is submitted) without refetching the lot.
  function replaceOrder(updated: Order) {
    updateOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  const loadingView = <div className="text-center py-16 text-muted">Loading…</div>;
  const failed = (what: string, l: Load<unknown[]>, retry: () => void) =>
    l.state === "error" ? <LoadError what={what} error={l.error} onRetry={retry} onLogin={() => void logout()} /> : null;

  if (!user) return null;

  return (
    <div>
      <h1 className="font-serif font-medium text-3xl mb-6">Your account</h1>
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
          {tab === "consults" ? (
            consultsLoad.state === "loading" ? (
              loadingView
            ) : consultsLoad.state === "error" ? (
              failed("your consultations", consultsLoad, retryConsults)
            ) : (
              <ConsultsTab consults={consultsLoad.data} />
            )
          ) : ordersLoad.state === "loading" ? (
            loadingView
          ) : ordersLoad.state === "error" ? (
            failed("your orders", ordersLoad, retryOrders)
          ) : (
            <>
              {tab === "overview" && (
                <OverviewTab
                  user={user}
                  orders={ordersLoad.data}
                  consults={consultsLoad.state === "ready" ? consultsLoad.data : null}
                  onOrderChange={replaceOrder}
                />
              )}
              {tab === "orders" && <OrdersTab orders={ordersLoad.data} onOrderChange={replaceOrder} />}
              {tab === "track" && <TrackTab orders={ordersLoad.data} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
