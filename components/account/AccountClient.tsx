"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthForm } from "./AuthForm";
import { AccountDashboard } from "./AccountDashboard";

export function AccountClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-16 text-muted">Loading…</div>;
  }

  return user ? <AccountDashboard /> : <AuthForm />;
}
