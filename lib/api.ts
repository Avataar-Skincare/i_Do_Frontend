const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export class ApiError extends Error {
  status: number;
  /** Stable machine-readable code from the contract (e.g. STORE_NOT_LIVE); branch on this, show `message`. */
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function rawRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    // Lets the browser send/receive the ido_at/ido_rt HttpOnly cookies — this
    // is what the whole login flow now runs on, not a token this code ever
    // touches. X-Requested-With is required by the backend's cookie-auth CSRF
    // check (a plain cross-site HTML form post can't set this header).
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-Requested-With": "ido", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(res.status, message || `Request to ${path} failed (${res.status})`, body.code);
  }
  return res.json();
}

// Dedups concurrent 401s into one /auth/refresh call instead of each one racing its own.
let refreshingPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshingPromise) {
    // No body needed — the browser attaches ido_rt automatically (it's scoped
    // to /auth), and the new ido_at/ido_rt pair arrives as Set-Cookie headers
    // on the response. Nothing here ever touches a raw token value.
    refreshingPromise = rawRequest("/auth/refresh", { method: "POST", body: JSON.stringify({}) })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

/**
 * A 401 means the 15-minute access-token cookie expired — try one silent
 * refresh and replay the exact same request before giving up. Never attempts
 * this for `/auth/refresh` itself (that 401 is final) or more than once per call.
 */
async function request<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  try {
    return await rawRequest<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !isRetry && path !== "/auth/refresh") {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, init, true);
    }
    throw err;
  }
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init);
}

export function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "DELETE" });
}
