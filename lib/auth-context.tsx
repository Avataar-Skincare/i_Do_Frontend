"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: string;
  createdAt: string;
  /** Only meaningful when `email` is set. */
  emailVerifiedAt: string | null;
  /** Only meaningful when `phone` is set. */
  phoneVerifiedAt: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  /** Sends a 6-digit email code — works for both a new and an existing account. */
  sendEmailOtp: (email: string) => Promise<void>;
  /** Verifying logs the account in — creating it first if this email has no account yet (fullName only used then). */
  verifyEmailOtp: (email: string, code: string, fullName?: string) => Promise<void>;
  /** Sends a 6-digit SMS code to this phone — works for both a new and an existing phone account. */
  sendPhoneOtp: (phone: string) => Promise<void>;
  /** Verifying logs the account in — creating it first if this phone has no account yet (fullName only used then). */
  verifyPhoneOtp: (phone: string, code: string, fullName?: string) => Promise<void>;
  claimOrder: (token: string, opts?: { fullName?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * No token of any kind is ever handled here — login sets HttpOnly ido_at/
 * ido_rt cookies server-side (see i_Do_Backend's AuthController), which this
 * code can't read even if it wanted to. Every call just needs `credentials:
 * "include"` (lib/api.ts does this on every request), and the browser does
 * the rest, including the silent-refresh-and-retry on an expired access
 * token cookie.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => {
        // No session cookie, or the refresh token is also dead — not logged in.
      })
      .finally(() => setLoading(false));
  }, []);

  async function sendEmailOtp(email: string) {
    await apiPost("/auth/email/send-otp", { email });
  }

  async function verifyEmailOtp(email: string, code: string, fullName?: string) {
    const res = await apiPost<{ user: AuthUser }>("/auth/email/verify-otp", { email, code, fullName });
    setUser(res.user);
  }

  async function sendPhoneOtp(phone: string) {
    await apiPost("/auth/phone/send-otp", { phone });
  }

  async function verifyPhoneOtp(phone: string, code: string, fullName?: string) {
    const res = await apiPost<{ user: AuthUser }>("/auth/phone/verify-otp", { phone, code, fullName });
    setUser(res.user);
  }

  async function logout() {
    await apiPost("/auth/logout", {}).catch(() => {
      // Best-effort — the user is logging out either way, not staying stuck on a network error.
    });
    setUser(null);
  }

  async function deleteAccount() {
    await apiDelete("/auth/me");
    setUser(null);
  }

  async function claimOrder(token: string, opts?: { fullName?: string }) {
    const res = await apiPost<{ user: AuthUser }>("/auth/claim-order", {
      token,
      fullName: opts?.fullName,
    });
    setUser(res.user);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        deleteAccount,
        sendEmailOtp,
        verifyEmailOtp,
        sendPhoneOtp,
        verifyPhoneOtp,
        claimOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
