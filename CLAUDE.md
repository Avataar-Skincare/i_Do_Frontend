# i_Do_Frontend

@AGENTS.md

> ## ⚠️ @Vishal — action needed
> You built this repo and `i_Do_Backend` with Claude, and the backend's code comments point at a
> `CLAUDE.md` that was never committed — there's likely a local one for this repo too. Please:
> 1. Merge everything from your local `CLAUDE.md` (design decisions, conventions, gotchas, local
>    setup) into this file — keep or correct what's below, don't just append a second copy.
> 2. Commit any local-only setup files this repo needs (e.g. `docker-compose.yml`, `.env.example`).
> 3. Push, then delete this callout.

Customer-facing website for **i do** (idowellness.ai) — the storefront for Avataar's smart ring.
**"i do" is the rebrand of LUME**: the same ring as `lume-backend` / `lume-mobile`. "Lume" anywhere
means this product. This site is marketing + shop + account + consult booking only; the ring's own
app and health data live in `lume-mobile` / `lume-backend` and share nothing with this site.

API: `../i_Do_Backend` (NestJS). This repo has no server-side data access of its own.

## Stack

Next.js **16** (App Router, `output: "standalone"`) · React 19 · Tailwind CSS 4 · TypeScript ·
**pnpm** (not npm — the backend uses npm). Next 16 has breaking changes vs. older docs — see
`AGENTS.md` above and read `node_modules/next/dist/docs/` before using an unfamiliar API.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

Set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3011` to match the backend's `.env.example`).
Without it, `lib/api.ts` falls back to `http://localhost:3001`. `NEXT_PUBLIC_*` is **inlined at
build time** — a Docker image is built for one API URL; changing it means rebuilding.

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

## Conventions

- **Money is integer paise** everywhere (`priceInPaise: 1499900` = ₹14,999, `codFeeInPaise: 5000`
  in `lib/content/site.ts`). Format only at render with `lib/format.ts`.
- The `Order` type in `lib/orders-storage.ts` mirrors `i_Do_Backend/src/orders/entities/order.entity.ts`
  — change both together.
- Placing an order and booking a consult both require login (backend enforces it).
- Remote images only from `cdn.avataarskin.com/static/cms/**` (`next.config.ts`).

## Checkout flow

Cart (localStorage) → `/checkout` → for online payment: `POST /orders/razorpay-order {amount}` →
Razorpay widget → `POST /orders` with the signed payment → `/confirm`. COD skips Razorpay and adds
the COD fee. ⚠️ The total is computed **here, in the browser**, and the backend currently trusts it
— see the Known gaps in `i_Do_Backend/CLAUDE.md`. Don't add more client-trusted money fields.

## Hosting (planned, nothing live yet — 2026-10-14)

Not deployed. Plan: runs as a container on a new dedicated "ring" EC2 box alongside `i_Do_Backend`
and `lume-backend` (prod + staging), behind nginx, at `idowellness.ai`. See `i_Do_Backend/CLAUDE.md`
and the shared AWS doc at `../CLAUDE.md`.

## Known gaps

- **`docker build` will fail:** the `Dockerfile` copies `/app/public`, but the repo has no `public/`
  directory. Add an empty `public/.gitkeep` or drop that line.
- No tests, no CI.
