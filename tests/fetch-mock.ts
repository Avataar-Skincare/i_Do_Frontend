import { vi } from "vitest";

export type Call = { method: string; path: string; body: unknown; headers: Record<string, string>; credentials?: RequestCredentials };
type Reply = { status?: number; body?: unknown } | ((call: Call) => { status?: number; body?: unknown });

/**
 * Stubs global fetch with a route table keyed "METHOD /path". Every request is recorded in `calls`.
 * An unrouted request fails the test loudly with a 599 so a missing mock is never mistaken for an app bug.
 */
export function mockApi(routes: Record<string, Reply | Reply[]>) {
  const calls: Call[] = [];
  const counters: Record<string, number> = {};
  const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname;
    const method = (init.method ?? "GET").toUpperCase();
    const call: Call = {
      method,
      path,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
      headers: (init.headers ?? {}) as Record<string, string>,
      credentials: init.credentials,
    };
    calls.push(call);
    const key = `${method} ${path}`;
    let reply = routes[key];
    if (Array.isArray(reply)) {
      const i = counters[key] ?? 0;
      counters[key] = i + 1;
      reply = reply[Math.min(i, reply.length - 1)];
    }
    if (!reply) return new Response(JSON.stringify({ message: `unmocked ${key}` }), { status: 599 });
    const r = typeof reply === "function" ? reply(call) : reply;
    const status = r.status ?? 200;
    return new Response(status === 204 ? null : JSON.stringify(r.body ?? {}), { status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock, count: (key: string) => calls.filter((c) => `${c.method} ${c.path}` === key).length };
}
