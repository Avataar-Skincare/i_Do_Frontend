"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPost, apiDelete, withAuth } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: string;
  createdAt: string;
  /** Only meaningful when `email` is set — a phone-only account has no email to verify. */
  emailVerifiedAt: string | null;
  /** Only meaningful when `phone` is set. */
  phoneVerifiedAt: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  /** Set only while a just-registered (by email) account is waiting on its OTP — see register(). */
  pendingVerificationEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  /** Email signups hold no session until verifyEmail() succeeds. Phone accounts don't use this — see sendPhoneOtp/verifyPhoneOtp. */
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  /** Sends a 6-digit SMS code to this phone — works for both a new and an existing phone account. */
  sendPhoneOtp: (phone: string) => Promise<void>;
  /** Verifying logs the account in — creating it first if this phone has no account yet (fullName only used then). */
  verifyPhoneOtp: (phone: string, code: string, fullName?: string) => Promise<void>;
  claimOrder: (token: string, opts?: { password?: string; fullName?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "ido_auth_token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Plain (non-hook) accessor for code outside React components — e.g. orders-storage/consults-storage. */
export function getAuthToken(): string | null {
  return readToken();
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore — same fallback pattern as cart-context
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<{ token: string; user: AuthUser } | null>(null);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiGet<AuthUser>("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(setUser)
      .catch(() => writeToken(null)) // stale/expired token — drop it silently
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await apiPost<{ user: AuthUser; token: string }>("/auth/login", { email, password });
    writeToken(res.token);
    setUser(res.user);
  }

  async function register(email: string, password: string, fullName?: string) {
    const res = await apiPost<{ user: AuthUser; token: string }>("/auth/register", { email, password, fullName });
    setPendingVerification({ token: res.token, user: res.user });
  }

  async function sendPhoneOtp(phone: string) {
    await apiPost("/auth/phone/send-otp", { phone });
  }

  async function verifyPhoneOtp(phone: string, code: string, fullName?: string) {
    const res = await apiPost<{ user: AuthUser; token: string }>("/auth/phone/verify-otp", { phone, code, fullName });
    writeToken(res.token);
    setUser(res.user);
  }

  function logout() {
    writeToken(null);
    setUser(null);
  }

  async function deleteAccount() {
    const token = readToken();
    await apiDelete("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    writeToken(null);
    setUser(null);
  }

  async function verifyEmail(code: string) {
    const tok = pendingVerification?.token ?? readToken();
    await apiPost("/auth/verify-email", { code }, withAuth(tok));

    if (pendingVerification) {
      writeToken(pendingVerification.token);
      setUser({ ...pendingVerification.user, emailVerifiedAt: new Date().toISOString() });
      setPendingVerification(null);
    } else {
      setUser((prev) => (prev ? { ...prev, emailVerifiedAt: new Date().toISOString() } : prev));
    }
  }

  async function resendVerificationEmail() {
    const tok = pendingVerification?.token ?? readToken();
    await apiPost("/auth/resend-verification", {}, withAuth(tok));
  }

  async function claimOrder(token: string, opts?: { password?: string; fullName?: string }) {
    const res = await apiPost<{ user: AuthUser; token: string }>("/auth/claim-order", {
      token,
      password: opts?.password,
      fullName: opts?.fullName,
    });
    writeToken(res.token);
    setUser(res.user);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingVerificationEmail: pendingVerification?.user.email ?? null,
        login,
        register,
        logout,
        deleteAccount,
        verifyEmail,
        resendVerificationEmail,
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
