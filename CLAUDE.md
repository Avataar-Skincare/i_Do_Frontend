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

Built against the API contract (`../i_Do_Backend/api/openapi.yaml`, v1.0.0). Amounts are
integer paise and **the client never sends a price**.

- **Cart is `localStorage` only** (`lib/cart-context.tsx`, via `useSyncExternalStore`) and holds
  at most **one ring** (qty fixed at 1; adding again replaces it). It stores `finishId`
  (gold, silver, black) for the API. An `Order` is what gets persisted, by the backend.
- **Catalog and quote** (`lib/catalog.ts`): `GET /catalog` gives the display price, COD fee
  and whether COD is on; `POST /orders/quote {finish, paymentMethod, pin}` gives the server's
  totals and `codAvailable` once a 6-digit PIN is entered. Totals shown before that are
  estimates. A quote is only used for the finish, method and PIN it was fetched for.
- **Placing an order** (`components/checkout/CheckoutForm.tsx`, `lib/orders-storage.ts`):
  `POST /orders` with an `Idempotency-Key`. One key per checkout attempt: reused when the
  same details are retried (so "Payment not completed. Try again" resumes the same pending
  order), a fresh key as soon as any detail changes. Online orders return a `razorpay`
  object; the widget opens (`lib/razorpay.ts`), then `POST /orders/{id}/payment/verify`
  sends the result. Closing the widget raises `PaymentNotCompletedError` and returns to
  checkout with the cart intact. A verify failure other than `SIGNATURE_INVALID` still goes to
  `/confirm`, because Razorpay's webhook is the source of truth. COD orders go straight to
  `/confirm` as `cod_pending` (ops confirm by phone or WhatsApp).
- **Errors** carry the contract's `code` (`ApiError.code`): `STORE_NOT_LIVE` (launch gate
  closed), `COD_NOT_SERVICEABLE`, `GSTIN_INVALID`, `SIGNATURE_INVALID`,
  `ACCOUNT_HAS_OPEN_ORDER`. Branch on the code; show the server's `message`.
- **`/confirm`** reads `GET /orders/{id}` (owner only) and keeps polling every 4 s for about
  12 minutes while the status is `pending_payment` ("Confirming your payment…").
- **Order status** shown on `/confirm` and the account pages is the real `order.status`
  (`lib/order-status.ts`: the 9 states from LLD §3.1). `GET /orders/mine` never returns
  `pending_payment` orders.

## Sizing: the kit is included, the customer never picks a size at order time

Confirmed with the manager 15–16 Oct 2026 (see the `i do Website Decisions` doc). Every
order starts with the sizing kit, which ships first; the customer submits their size from
their account after the kit arrives, then the ring ships. `/shop`
(`components/shop/ProductInfo.tsx`) shows a "Sizing kit included with your ring" card and
the sizes currently available (display only, nothing to select). Add to bag stores
`size: "Sizing kit included"`. There is no "I know my size" path and no standalone kit
product; `/sizing` is only the size calculator. A submitted size is final (the account page
must ask "This can't be changed later. Confirm?" and send `confirmed: true`). Wording is
"sizing kit included with your ring", never "free sizing kit".
`lib/content/shop.ts`'s `SIZING_KIT_IMAGE` (`ring_4.webp`) is the kit's image.

Other confirmed rules reflected in the copy: COD fee ₹100 (never refunded), full COD
payment at sizing-kit delivery, delivery 4–7 working days, no refund on a delivered ring,
replacement only for damaged or wrong items reported within 7 days with a box-opening
video and photos. `SITE.socialProofEnabled` (default `false`) hides the unconfirmed
rating, customer count, cities, Shark Tank line and sample reviews until the business
confirms they are real.

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

## Hosting and deploys (live on test since 2026-10-19)

Live at **`https://test.idowellness.ai`** (ido-test server), calling the API at
`https://test-api.idowellness.ai`. Prod (`idowellness.ai`) comes from 29 Oct.

**Branches:** feature → PR into **`testing`** → deployed to test automatically (~5 min; watch the
Actions tab) → PR `testing` → `main` for prod. Never push straight to `main`.

**`NEXT_PUBLIC_API_URL` is baked in at build time** (it ends up in the JavaScript sent to browsers),
so the deploy workflow passes it as a Docker build arg and the image is environment-specific: test
images are tagged `test-<short sha>` in ECR `ido/website-frontend`; prod will build its own. Never put
a secret in any `NEXT_PUBLIC_*` variable — every visitor can read it.

Pipeline details (OIDC, ECR, the locked deploy script, rollback) and the server layout are in
`../i_Do_Backend/CLAUDE.md` → Hosting and deploys; the server definitions live in
`i_Do_Backend/infra/ido-test/`.

## Known gaps

- `lib/content/site.ts`'s `SITE` object still has placeholder contact info (support
  email, phone, WhatsApp number, registered address, GSTIN, CIN) — real values needed
  before public launch.
- Razorpay checkout is wired; the test backend now has **test-mode** keys (no real money). Live keys
  come at launch.
- WhatsApp OTP (alongside the working SMS OTP) is built but not live on the backend —
  waiting on real Messenger-gateway credentials.
- No automated tests. CI builds and deploys to test, but has no test step.
