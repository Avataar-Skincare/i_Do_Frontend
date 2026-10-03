const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(res.status, message || `Request to ${path} failed (${res.status})`);
  }
  return res.json();
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

/** Merges an Authorization header into a fetch init when a token is present, else returns init unchanged. */
export function withAuth(token: string | null, init?: RequestInit): RequestInit | undefined {
  if (!token) return init;
  return { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } };
}
