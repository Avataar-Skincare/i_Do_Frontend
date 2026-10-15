# i_Do_Frontend

The **i do** smart ring website (idowellness.ai) — marketing + e-commerce storefront
(shop, cart, checkout, account, order tracking, consult booking, journal). Next.js 16
(App Router) + TypeScript + Tailwind CSS 4, package manager is **pnpm** (not npm — the
sibling `i_Do_Backend` repo uses npm; don't mix lockfiles between the two).

Sibling repo: `../i_Do_Backend` (NestJS) is the API this site talks to — see its own
README/CLAUDE.md for what it exposes. This repo has no backend of its own; every real
write (orders, consults, auth, contact, newsletter) goes to that API. **Cart stays in
browser `localStorage`** — there's no cart table anywhere, by design (an Order is what
gets persisted, the cart itself is ephemeral client state).

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` (`.env.local`) must point at a running `i_Do_Backend` — defaults
to `http://localhost:3011`. This is a Next.js **public** env var: for a Docker build
it has to be passed as a build **arg**, not a runtime `environment:` entry — see the
comment in `Dockerfile` if that's ever confusing (`NEXT_PUBLIC_*` vars are inlined into
the client bundle at build time, so setting them on an already-built image does nothing).

## Routes

`/`, `/shop` (product page), `/ring`, `/app` (companion-app marketing, no functional
link to the actual app — that's the separate `Lume_ring` repo), `/sizing`, `/cart`,
`/checkout`, `/confirm` (order confirmation), `/account` (auth + order/consult
dashboard), `/consults`, `/claim-order` (turns a historical guest order into a real
account), `/reset-password`, `/about`, `/journal`, `/support`.

## Auth

Two different flows live side by side in `components/account/AuthForm.tsx` behind a
top-level email/phone toggle (see `lib/auth-context.tsx`):
- **Email** — password-based, with a signup-verification-code step before the session
  is live (`pendingVerificationEmail`/`verifyEmail()`).
- **Phone** — fully passwordless. Entering a phone number sends an OTP
  (`sendPhoneOtp`); submitting the code (`verifyPhoneOtp`) logs in an existing account
  or creates a new one, in one step. There is no password for a phone account.

The auth token lives in `localStorage` (`lib/auth-context.tsx`'s `writeToken`/`readToken`),
attached automatically to API calls that need it (`lib/api.ts`'s `withAuth()`).

## Conventions

- Money is always **integer paise** — format with the shared `formatINR()` helper
  (`lib/format.ts`), never a rupee float.
- Site-wide config/content lives in `lib/content/*.ts` (`site.ts` for brand/price/nav,
  `shop.ts` for the product gallery, `product.ts` for finishes/sizes, etc.) — not
  scattered inline in components.
- `lib/content/site.ts`'s `SITE` object has several fields still marked `// placeholder`
  (support email/phone/WhatsApp number, registered address, GSTIN, CIN) — real values
  are needed before this goes live publicly.
- Components: PascalCase, one component per file, colocated small subcomponents.

See `CLAUDE.md` in this repo for the fuller build history and the reasoning behind
specific decisions (why phone login is passwordless, why the sizing kit is bundled into
the ring's own add-to-bag flow, etc).

## Known gaps

- Order/consult status on `/confirm` and the account dashboard is **simulated**
  client-side from days elapsed since the order date (`lib/order-status.ts`) — not
  driven by any real fulfillment system yet.
- Razorpay checkout is wired but not live — `i_Do_Backend` is still waiting on real
  test-mode keys.
- WhatsApp OTP (alongside the working SMS OTP) is built but not live — waiting on real
  Messenger-gateway credentials, see `i_Do_Backend`'s CLAUDE.md.
