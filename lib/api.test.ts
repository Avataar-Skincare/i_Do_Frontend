import { describe, it, expect } from "vitest";
import { mockApi } from "@/tests/fetch-mock";
import { apiGet, apiPost, ApiError } from "@/lib/api";

describe("request basics", () => {
  it("always sends cookies and the CSRF header", async () => {
    const api = mockApi({ "GET /thing": { body: { ok: true } } });
    await apiGet("/thing");
    expect(api.calls[0].credentials).toBe("include");
    expect(api.calls[0].headers["X-Requested-With"]).toBe("ido");
  });

  it("turns an error body into an ApiError with status, message and code", async () => {
    mockApi({ "POST /orders": { status: 409, body: { message: "Size is locked", code: "SIZE_LOCKED" } } });
    const err = await apiPost("/orders", {}).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, message: "Size is locked", code: "SIZE_LOCKED" });
  });

  it("joins validation-message arrays and falls back when there is no body", async () => {
    mockApi({
      "POST /a": { status: 400, body: { message: ["x is bad", "y is bad"] } },
      "POST /b": { status: 500, body: {} },
    });
    expect(((await apiPost("/a", {}).catch((e) => e)) as Error).message).toBe("x is bad, y is bad");
    expect(((await apiPost("/b", {}).catch((e) => e)) as Error).message).toContain("failed (500)");
  });
});

describe("silent refresh on 401", () => {
  it("refreshes once and replays the same request", async () => {
    const api = mockApi({
      "GET /auth/me": [{ status: 401, body: { message: "expired" } }, { body: { id: "u1" } }],
      "POST /auth/refresh": { body: {} },
    });
    await expect(apiGet("/auth/me")).resolves.toEqual({ id: "u1" });
    expect(api.count("POST /auth/refresh")).toBe(1);
    expect(api.count("GET /auth/me")).toBe(2);
  });

  it("gives up with the original 401 when the refresh token is dead", async () => {
    const api = mockApi({
      "GET /auth/me": { status: 401, body: { message: "expired" } },
      "POST /auth/refresh": { status: 401, body: { message: "gone" } },
    });
    await expect(apiGet("/auth/me")).rejects.toMatchObject({ status: 401, message: "expired" });
    expect(api.count("GET /auth/me")).toBe(1);
  });

  it("does not loop: a replay that 401s again is final", async () => {
    const api = mockApi({
      "GET /orders/mine": { status: 401, body: { message: "nope" } },
      "POST /auth/refresh": { body: {} },
    });
    await expect(apiGet("/orders/mine")).rejects.toMatchObject({ status: 401 });
    expect(api.count("GET /orders/mine")).toBe(2);
    expect(api.count("POST /auth/refresh")).toBe(1);
  });

  it("never tries to refresh the refresh call itself", async () => {
    const api = mockApi({ "POST /auth/refresh": { status: 401, body: {} } });
    await expect(apiPost("/auth/refresh", {})).rejects.toBeInstanceOf(ApiError);
    expect(api.count("POST /auth/refresh")).toBe(1);
  });

  it("shares one refresh between concurrent 401s", async () => {
    const api = mockApi({
      "GET /a": [{ status: 401, body: {} }, { body: { a: 1 } }],
      "GET /b": [{ status: 401, body: {} }, { body: { b: 1 } }],
      "POST /auth/refresh": { body: {} },
    });
    const [a, b] = await Promise.all([apiGet("/a"), apiGet("/b")]);
    expect(a).toEqual({ a: 1 });
    expect(b).toEqual({ b: 1 });
    expect(api.count("POST /auth/refresh")).toBe(1);
  });

  it("does not refresh for non-401 errors", async () => {
    const api = mockApi({ "GET /x": { status: 403, body: { message: "no" } } });
    await expect(apiGet("/x")).rejects.toMatchObject({ status: 403 });
    expect(api.count("POST /auth/refresh")).toBe(0);
  });
});
