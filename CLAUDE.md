# i_Do_Frontend

The **i do** e-commerce website (idowellness.ai) — the storefront that sells Avataar's
smart ring. **"i do" is the rebrand of LUME**: the same ring as `lume-backend` /
`lume-mobile`. If a comment, ticket or teammate says "Lume", it means this product.

This is **only the website** — shop, checkout, account, consult booking, journal,
legal pages. It is *not* the companion app customers use after buying the ring; that
app lives entirely in the separate `Lume_ring` repo. The `/app` nav tab here is just
marketing copy and real screenshots (`lib/content/app-screenshots.ts`,
`components/ui/PhoneScreenshot.tsx`) — no functional or data link to the real app.

Sibling repo: `../i_Do_Backend` (NestJS) is the only API this site calls — this repo
has no server-side data access of its own. See its CLAUDE.md for the full route/auth
surface.

## Stack

Next.js **16** (App Router, `output: "standalone"`) · React 19 · Tailwind CSS 4 ·
TypeScript · **pnpm** (not npm — the backend uses npm). No state-management library —
just React state + two small context providers (`AuthProvider`, `CartProvider`, both
mounted once in `app/layout.tsx`). Next 16 has breaking changes vs. older training
data — see `AGENTS.md` at this repo's root and read `node_modules/next/dist/docs/`
before using an unfamiliar API.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

Set `NEXT_PUBLIC_API_URL` (`.env.local`, e.g. `http://localhost:3011` to match the
backend's default). Without it, `lib/api.ts` falls back to `http://localhost:3001` —
a stale default that doesn't match the backend's real port; always set it explicitly.
`NEXT_PUBLIC_*` is **inlined at build time** — a Docker image is built for one API
URL; changing it means rebuilding, not just restarting the container.

## Source material

`reference/i_do_website.html` (at the shared repo root, one level up) is a static,
single-file prototype — real copy, real routes, real interaction logic, but
everything in it is fake (cart/orders/auth in `localStorage`, no payment gateway).
Treat it as **content and UX source-of-truth, not code to build on**: port the copy,
layout decisions and interaction logic (e.g. "checkout validates phone as 10 digits,
PIN as 6 digits") into real components — don't wrap its template-literal strings in a
framework.

## Layout

| Path | What lives there |
|---|---|
| `app/` | Routes: `/` (home), `/ring`, `/app`, `/about`, `/journal`, `/journal/[slug]`, `/sizing`, `/support`, `/legal/[slug]`, `/shop`, `/cart`, `/checkout`, `/confirm`, `/account`, `/claim-order`, `/reset-password`, `/consults` |
| `components/<page>/` | Components grouped by the page that uses them; shared primitives in `components/ui/`, header/footer in `components/layout/` |
| `lib/content/*.ts` | **All site copy and product data** (prices, specs, FAQs, legal, journal). Edit text here, not in JSX |
| `lib/api.ts` | The only HTTP client — `apiGet/Post/Patch/Delete`, `withAuth(token)`, `ApiError` |
| `lib/auth-context.tsx` | Auth state; JWT in `localStorage["ido_auth_token"]`. Email+password or passwordless phone OTP |
| `lib/cart-context.tsx` | Cart in `localStorage["ido_cart"]` — client-only, never sent until checkout |
| `lib/orders-storage.ts`, `lib/consults-storage.ts` | Thin API wrappers (despite the names, nothing is stored locally) |
| `lib/razorpay.ts` | Lazy-loads Checkout.js, creates the Razorpay order via the backend, returns the signed payment |

## Auth

`lib/auth-context.tsx` + `components/account/AuthForm.tsx`. Two genuinely different
flows behind one top-level email/phone toggle, because the backend treats them as
different account types:
- **Email**: password-based. `register()` doesn't persist a session immediately —
  it sets `pendingVerification` and the UI moves to a 6-digit code step
  (`verifyEmail()`); only on success does a real token get written.
- **Phone**: passwordless. There is no password field at all for this path — entering
  a phone number + submitting a 6-digit code (`sendPhoneOtp`/`verifyPhoneOtp`) is the
  entire flow, and it works identically whether the phone is new or returning
  (creates-or-logs-in in one call, mirroring the backend).
- `AuthModal.tsx` wraps `AuthForm` for the "log in to continue" interrupt pattern used
  by both checkout and consult booking — placing an order or booking a consult
  requires an account (backend-enforced); browsing/filling the form doesn't.

## Cart & checkout

- **Cart is `localStorage` only** — no backend table, by design. An `Order` is what
  gets persisted; the cart itself is ephemeral. The `Order` type in
  `lib/orders-storage.ts` mirrors `i_Do_Backend/src/orders/entities/order.entity.ts`
  — change both together.
- `CartItem` dedup key is `id + finish + size` — adding the same combo again just
  bumps `qty`. Decrementing qty to 0 (the "−" button in `CartLineItem.tsx`) removes
  the line entirely, same end result as the explicit "Remove" button.
- **Flow**: cart (localStorage) → `/checkout` → COD calls `saveOrder()` directly;
  online payment creates a Razorpay order first (`POST /orders/razorpay-order`),
  opens Checkout.js, then calls `saveOrder()` with the signed payment — the backend
  re-verifies the signature server-side before persisting anything, the frontend's
  own claim of success is never trusted alone. Both paths `clearCart()` and redirect
  to `/confirm?orderId=...` only on real success.
  ⚠️ **The order total is computed here, in the browser, and the backend currently
  trusts it as sent** — see the Known gaps in `i_Do_Backend/CLAUDE.md`. Don't add
  more client-trusted money fields until that's fixed.
- Order/consult status shown on `/confirm` and the account dashboard is **simulated**
  client-side from days elapsed since the order date (`lib/order-status.ts`, ported
  from the prototype's `ORDER_STAGES`) — there's no real fulfillment backend yet. Once
  shipment tracking (e.g. Delhivery) exists, this needs to be replaced with the real
  `order.status`, not patched further.

## Sizing: bundled into the ring's add-to-bag flow, not a separate product

Changed 2026-10-13 (matching a competitor's — Luna's — product-page UX). The
standalone "Sizing" nav tab is gone (`lib/content/site.ts`'s `NAV`); `/sizing` itself
still exists (linked from the footer and `/ring`) but is no longer the primary path.
On `/shop`, `components/shop/ProductInfo.tsx`'s size section defaults to a selected
**"Free Sizing Kit"** card (`sizeMode: "kit" | "known"`, default `"kit"`) — "Add to
bag" works immediately with no numeric size chosen, storing `size: "Free Sizing Kit"`
on the cart/order line instead of a US size. Picking "I know my size" reveals the
original size grid instead, same as before. `lib/content/shop.ts`'s
`SIZING_KIT_IMAGE` (`ring_4.webp`, a packaging shot) is the dedicated image for this
card and for `/sizing`'s own kit button — deliberately not the ring's own product
photo, so the kit reads as its own distinct thing in the cart.

## Conventions

- **Money is always integer paise** — format with the shared `formatINR()` helper
  (`lib/format.ts`). Never introduce a rupee float.
- Site-wide config/content lives in `lib/content/*.ts`, not scattered inline in
  components — `site.ts` (brand/price/nav/contact placeholders), `shop.ts` (gallery,
  the one real product), `product.ts` (finishes/sizes), etc.
- Remote images only from `cdn.avataarskin.com/static/cms/**` (`next.config.ts`).
- Pull real copy out of `reference/i_do_website.html` verbatim where it reads as
  finished marketing copy; flag anything that reads like a placeholder ("Lorem",
  generic stock claims) instead of silently keeping it.
- Components: PascalCase, one per file, colocate small subcomponents.
- Every new page needs a route, a loading state, and an empty state.

## Hosting (planned, nothing live yet — 2026-10-14)

Not deployed. Plan: runs as a container on a new dedicated "ring" EC2 box alongside
`i_Do_Backend` and `lume-backend` (prod + staging), behind nginx, at
`idowellness.ai`. See `i_Do_Backend/CLAUDE.md` for the fuller infra plan.

## Known gaps

- `lib/content/site.ts`'s `SITE` object still has placeholder contact info (support
  email, phone, WhatsApp number, registered address, GSTIN, CIN) — real values needed
  before public launch.
- Razorpay checkout is fully wired but not live — the backend is waiting on real
  test-mode keys.
- WhatsApp OTP (alongside the working SMS OTP) is built but not live on the backend —
  waiting on real Messenger-gateway credentials.
- No automated tests, no CI.
