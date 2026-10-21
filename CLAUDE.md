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
| `app/` | Routes: `/` (home), `/ring`, `/app`, `/about`, `/journal`, `/journal/[slug]`, `/sizing`, `/support`, `/legal/[slug]`, `/shop`, `/cart`, `/checkout`, `/confirm`, `/account`, `/consults` |
| `components/<page>/` | Components grouped by the page that uses them; shared primitives in `components/ui/`, header/footer in `components/layout/` |
| `lib/content/*.ts` | **All site copy and product data** (prices, specs, FAQs, legal, journal). Edit text here, not in JSX |
| `lib/api.ts` | The only HTTP client — `apiGet/Post/Patch/Delete`, silent 401 refresh, `ApiError` (with the contract `code`) |
| `lib/auth-context.tsx` | Auth state; cookie session, passwordless email or phone OTP |
| `lib/cart-context.tsx` | Cart in `localStorage["ido_cart"]` — client-only, never sent until checkout |
| `lib/orders-storage.ts`, `lib/consults-storage.ts` | Thin API wrappers (despite the names, nothing is stored locally) |
| `lib/razorpay.ts` | Lazy-loads Checkout.js, creates the Razorpay order via the backend, returns the signed payment |

## Auth

Passwordless, decided final: **email OTP or phone OTP, no password anywhere** (no register,
login, forgot-password, reset-password or verify-email screens). One form
(`components/account/AuthForm.tsx`) with an email/phone toggle: enter the address, enter the
6-digit code, done. It works the same for a new and a returning account (the first
successful code creates the account). `lib/auth-context.tsx` exposes
`sendEmailOtp/verifyEmailOtp` and `sendPhoneOtp/verifyPhoneOtp`.

- **Session = HttpOnly cookies** (`ido_at` 15 min, `ido_rt` 60 days) set by the API;
  `lib/api.ts` sends `credentials: "include"` and `X-Requested-With: ido`, and on a 401 makes
  one silent `POST /auth/refresh` and replays the request. No token is ever stored in
  `localStorage` or readable by this code.
- `AuthModal` wraps `AuthForm` for the "log in to continue" interrupt used by checkout and
  consult booking; it takes an `onSuccess` callback to carry on after login. An order or
  booking needs an account (backend-enforced); browsing and filling the form doesn't.
- **Contract gap:** API contract v1.0.0 only defines `/auth/phone/send-otp` and
  `/auth/phone/verify-otp` for OTP login. The email calls (`/auth/email/send-otp`,
  `/auth/email/verify-otp`) are not in the contract or the backend yet, so email sign-in
  can't work (or be mocked) until they are added. Per Dev Sync, log the change under
  "API contract changes" first.

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

## Submitting the ring size (Account → Orders)

`components/account/SizeSubmit.tsx`, shown inside `OrderCard` while an order is `kit_delivered`.
The customer picks a US size (6 to 13), sees "You're choosing US N. This can't be changed later.
Confirm?", and only then `POST /orders/{id}/size {usSize, confirmed: true}` is sent
(`submitSize` in `lib/orders-storage.ts`). The order then reads "Size US N is locked. Your ring ships
next." The target date (`sizeDueAt`, shown in IST with days left) is a reminder, never a cut-off: a size
is still accepted after it. A 409 `SIZE_LOCKED` or `INVALID_TRANSITION` shows the server message and
reloads the order. Sizes the catalog marks out of stock only get a "ships later" tag; backorder and
reservation stay invisible to the customer, per the contract.

## Catalog, tracking and order states (LLD §8)

- **`lib/use-catalog.ts`** is the one shared `GET /catalog` request. `/shop` takes the price, list price and
  per-finish stock from it (an out-of-stock size shows a dashed "ships later" chip, still read-only); the
  account size screen and checkout use the same data. If it can't be reached the page falls back to the
  static values in `lib/content/site.ts`, so nothing breaks.
- **`lib/order-status.ts`** holds the order-state helpers: `orderStatusLabel`, `ringReturning` (status
  `ring_shipped` while the newest ring shipment is `rto` reads "Your ring is on its way back to us"),
  `CANCEL_REASON_TEXT`, `refundLine` and `returningText`. Refund amounts are always the server's, never
  worked out in the browser.
- **Tracking** (`TrackTimeline`, `OrderCard`): a cancelled order shows its reason and refund; the kit and ring
  stages link to the courier (`Track with {courier} · AWB {awb}`, plain text if there is no URL).
- **`/confirm`** explains the two parcels (kit first, then the ring after the size is submitted).
- Legal copy includes the 15-day size target (a target, not a deadline) and `SITE.supportHours`.

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
