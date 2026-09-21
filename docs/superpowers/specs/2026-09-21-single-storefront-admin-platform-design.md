# Single storefront, live admin, order/dashboard tooling, feedback — design spec

Date: 2026-09-21

## Problem

Five related gaps, agreed with the user via brainstorming:

1. Two storefronts (`storefront-1`, `storefront-2`) are still split by a
   sticky 50/50 A/B proxy. The test is over — `storefront-2` wins and
   becomes the single public site at `officialzella.com`.
2. Admin edits (new product, stock change) don't show on the storefront
   until the next deploy, because storefront pages are statically
   prerendered at build time and admin's `revalidatePath()` can't reach a
   different Vercel project's cache.
3. Admin's order tooling is thin: no filtering/search, order detail doesn't
   show size/SKU per line, no packing slip, no CSV export, no order-event
   email notifications.
4. Admin's dashboard is three counters (active products, pending orders,
   total orders) — no revenue, no trends, no stock visibility.
5. There's no feedback/review mechanism anywhere — no schema, no form, no
   moderation, no display.

Decisions locked in during brainstorming (do not re-litigate during
implementation):

- `storefront-1` keeps existing as a live deployment at its `.vercel.app`
  URL — it is **not** deleted or defunded, only detached from the public
  domains and the A/B proxy removed from it.
- Freshness model is "truly instant, always": storefront rendering goes
  fully dynamic (`force-dynamic`), not webhook-revalidated or time-cached.
  A `ponytail:` comment marks the upgrade path for when traffic justifies
  the extra complexity.
- Order admin gets: status/date/search filtering, size+SKU+productId on
  every line, a packing-slip print view, CSV export, and an email to
  `jedi.raza007@gmail.com` (via `ADMIN_NOTIFY_EMAIL` env var) on order
  placed / cancelled (by customer or by admin).
- Dashboard shows: revenue+orders over a selectable range, best/worst
  sellers, low-stock/sold-out variants, and an order-status funnel that
  links into the Phase 3 filtered order list.
- Feedback is admin-moderated (submissions start `PENDING`, only `APPROVED`
  ones render publicly), collects rating/name(optional)/email(optional,
  private)/orderNumber(optional)/message, lives at `/feedback` on
  storefront-2 with `feedback.officialzella.com` rewritten to that route,
  and shows site-wide (not per-product) — both on `/feedback` itself and as
  a homepage strip.

This is five independently shippable phases. Sequence: **1 → 2 → 3 → 4 → 5**
(1 and 2 first because they're actively costing conversions/trust today).
Each phase should be implemented, tested, and committed before the next
starts — this spec does not assume they land in one plan/one PR.

## Phase 1 — storefront-2 becomes the site

**Domain move.** `officialzella.com` + `www.officialzella.com` currently
belong to the `storefront-1` Vercel project (`prj_OoE4gNsMUk0u0qaU0x8kjuezO9RS`).
Add both domains to the `storefront-2` project
(`prj_gpJCIKv3SDlmI74HCizMM1HSzJE0`), which reassigns them (Vercel moves a
domain between projects on the same team without a DNS change — DNS stays
in Cloudflare, unmanaged, pointed at Vercel's edge as today). Expect a short
TLS re-issue window. `storefront-1` keeps its `storefront-1-kohl.vercel.app`
alias and stays deployed from `main` as before; it just no longer owns the
apex/`www`.

**Remove the A/B gateway.** Delete `apps/storefront-1/src/proxy.ts` (the
`zella-ab` cookie split + cross-origin rewrite to storefront-2). Old
`zella-ab` cookies in visitors' browsers go inert on their own — nothing
reads that cookie once the proxy file is gone.

**Close storefront-2's parity gaps** (it was never the front door):
- Add a `/bundles` route that redirects (or renders identically) to `/pair`
  — anything with an old `/bundles` link must not 404. Simplest: a
  `redirect("/pair")` page at `apps/storefront-2/src/app/bundles/page.tsx`.
- Add `not-found.tsx` (storefront-2 has none; App Router falls back to a
  bare default).
- Add a favicon to `apps/storefront-2/public/` (currently empty).
- Add `sitemap.ts` and `robots.ts` under `apps/storefront-2/src/app/` — it's
  now the canonical indexed site.
- Confirm `NEXT_PUBLIC_SITE_URL=https://officialzella.com` is set on
  storefront-2's Vercel Production env (storefront-1 already has it;
  storefront-2's `.env`/`.env.local` were not checked against Vercel
  Production env vars during brainstorming — verify via `vercel env ls`
  before relying on it, since `layout.tsx`'s `metadataBase` reads it).

**Out of scope for this phase:** no copy/design changes to storefront-2
itself — it ships as-is, gaps above are the only additions.

## Phase 2 — instant reflection

**Root cause:** `packages/core/src/catalog.ts`'s Prisma-backed functions
(`getAllProducts`, `getProductsByCategory`, `getProductBySlug`,
`searchProducts`, `getRelatedProducts`) carry no Next.js caching directive.
Every storefront page that calls them gets statically prerendered at build
time (Next's default for a page with no dynamic API/`no-store` fetch in
App Router). Admin's `revalidatePath()` calls in
`apps/admin/src/app/admin/{products,inventory}/actions.ts` only invalidate
**admin's own** Vercel project's cache — they cannot reach storefront-2's
cache, which lives in a separate deployment. Hence: edit in admin, nothing
changes on the live site until the next `git push` triggers a rebuild.

**Fix:** add `export const dynamic = "force-dynamic";` to
`apps/storefront-2/src/app/layout.tsx`. Root-layout route segment config
cascades to every route under it (Next.js App Router behavior), so every
storefront-2 page becomes request-time rendered — a change in Postgres
(via admin, or anything else) is visible on the very next page load,
no build required.

This touches one file. It is deliberately **not** applied to
`storefront-1` (frozen, no longer the public site) or `admin` (already
dynamic — it's an authenticated dashboard, not prerendered).

```
// ponytail: force-dynamic hits Postgres on every request — fine at
// current traffic. If/when volume makes this measurably slow, upgrade to
// "use cache" + cacheTag("catalog") on the catalog.ts functions, and add a
// secret-signed POST /api/revalidate route that admin's product/inventory
// actions call after every write (see docs/superpowers/specs/... this
// file, Phase 2, for why the naive per-project revalidatePath() doesn't
// work across two Vercel projects).
```

## Phase 3 — admin order tooling

### Filtering & search

`apps/admin/src/app/admin/orders/page.tsx` becomes a Server Component that
reads `searchParams` (status, `from`, `to` dates, free-text `q`) via a
plain `<form method="get">` — status `<select>`, two native
`<input type="date">`, one text `<input>`. No client state, no JS library.

New `apps/admin/src/app/admin/orders/where.ts` exports
`buildOrderWhere(searchParams)` returning a `Prisma.OrderWhereInput`:
- `status`: exact match if provided.
- `from`/`to`: `createdAt` range (inclusive `from` 00:00, inclusive `to`
  23:59:59 local — construct via `new Date(to + "T23:59:59")`).
- `q`: case-insensitive `OR` across `orderNumber`, `customerName`,
  `customerPhone`, `customerEmail`.

Both the orders list page and the CSV export (below) import and call this
same function, so what you see on screen and what you download can never
drift apart.

### Order detail: size, SKU, product linkage

`apps/admin/src/app/admin/orders/[id]/page.tsx` already includes
`items: { include: { product: true } }` and groups by `pairGroupId`. Add to
each rendered line: `item.size` (already on `OrderItem`), `item.product.sku`,
and a link from `item.product.name` to `/admin/products/${item.productId}/edit`.
`item.productId` and `order.id` are both already in scope — just render
them. No schema change; this phase is display-layer only.

### Packing slip

New route `apps/admin/src/app/admin/orders/[id]/slip/page.tsx`: a
print-oriented layout (no admin nav/sidebar — a minimal wrapper, not the
shared `admin/layout.tsx` chrome) showing order number, delivery address,
each item with size + SKU + qty, and notes. Print via the browser's native
print dialog (`window.print()` on a button, or just instruct "use your
browser's print"); no PDF library. A `@media print` block hides the print
button itself.

### CSV export

New route `apps/admin/src/app/admin/orders/export/route.ts` — a GET
handler that calls `requireAdmin()`, re-parses the same `searchParams`
into `buildOrderWhere()`, queries orders with `items` + `address`, and
streams `text/csv` (`Content-Disposition: attachment`). Hand-built CSV
(escape quotes/commas per RFC 4180) — no CSV library for one flat table.
Columns: order number, date, status, customer name, phone, email, city,
item count, total, discount.

### Order-event email notifications

`packages/core/src/email.ts` gains `sendAdminOrderEmail(kind, order)`
alongside the existing `sendLoginPin`, reusing the same lazily-constructed
`Resend` client and the same placeholder-safe fallback (no `RESEND_API_KEY`
→ `console.log` instead of throwing). Recipient is
`process.env.ADMIN_NOTIFY_EMAIL` (new env var, both apps' Production env —
admin needs it for the cancel/status-change paths, storefront-2 needs it
for the place-order path). If the env var is unset, log and skip — never
throw.

Three call sites, each wrapped so a mail failure **cannot** fail the
underlying action (`try { await sendAdminOrderEmail(...) } catch (e) {
console.error(...) }` — never awaited unguarded inline with the DB write):
1. `packages/core/src/actions/place-order.ts` — after the `prisma.order.create`
   succeeds, kind `"placed"`.
2. `packages/core/src/actions/account.ts` `cancelOrder` — after the
   `updateMany` (only if it actually matched a row — check `count`), kind
   `"cancelled_by_customer"`.
3. `apps/admin/src/app/admin/orders/actions.ts` `updateOrderStatus` — only
   when the new status is `CANCELLED` and it differs from the prior status,
   kind `"cancelled_by_admin"`.

**Pre-flight the user must confirm before this phase ships:** `EMAIL_FROM`
is `Zella <verify@officialzella.com>`. If that sender domain isn't verified
in the Resend account, every admin notification email fails silently (by
design — never throws). Verify Resend domain status before or during this
phase; flag to the user if unverified rather than shipping silent no-ops.

## Phase 4 — dashboard

`apps/admin/src/app/admin/page.tsx` is rewritten (still a Server Component,
still one file) to read a `range` searchParam (`today` / `7d` / `30d` /
`all`, default `7d`) and render, alongside the existing product/order
counters:

- **Revenue + orders over the range**: sum of `totalCents` and count of
  `Order` where `status != CANCELLED` and `createdAt` in range; average
  order value = revenue / count. Daily breakdown via `groupBy` on a
  truncated date (Postgres `date_trunc` via `$queryRaw`, or in-memory
  bucketing of the range's orders if the range is short enough — prefer
  in-memory grouping for `today`/`7d`, since it avoids a raw SQL string for
  a small row count; use `$queryRaw` only if `30d`/`all` row counts make
  in-memory grouping wasteful). Rendered as CSS `width: %`-based horizontal
  bars — no chart library.
- **Best & worst sellers**: `prisma.orderItem.groupBy({ by: ["productId"],
  _sum: { quantity: true, priceCents: true } })` scoped to non-cancelled
  orders in range, joined back to product name, top 5 and bottom 5 by
  units.
- **Low stock / sold-out**: `prisma.productVariant.findMany({ where: {
  stock: { lte: 3 } } , include: { product: true } })`, sold-out (`stock:
  0`) visually flagged (red), grouped by product.
- **Status funnel**: count per `OrderStatus`, each count is a `<Link
  href="/admin/orders?status=X">` into Phase 3's filtered list — the
  dashboard does not re-implement order listing, it navigates to it.

## Phase 5 — feedback

### Schema

One migration, additive only (no existing table touched):

```prisma
enum FeedbackStatus {
  PENDING
  APPROVED
  REJECTED
}

model Feedback {
  id          String         @id @default(cuid())
  rating      Int            // 1–5, validated at the action layer
  name        String?
  email       String?        // admin-only, never rendered publicly
  orderNumber String?
  message     String
  status      FeedbackStatus @default(PENDING)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([status])
}
```

No relation to `Order`/`Customer` — `orderNumber` is a free-text optional
field admin can eyeball against the orders list, not a foreign key (a
customer submitting feedback isn't necessarily logged in, and the number is
self-reported).

### Public route: `/feedback` on storefront-2

New page `apps/storefront-2/src/app/feedback/page.tsx`: submission form
(rating 1–5 as radio/star input, name, email, order number, message — name/
email/orderNumber all optional per the approved design) above a list of
`status: APPROVED` feedback, newest first. Submission is a `"use server"`
action in `packages/core/src/actions/feedback.ts` (new file, alongside the
existing `place-order.ts`/`account.ts` — feedback belongs in `@zella/core`
so admin can read/write the same table via the same Prisma client without
duplicating validation).

**Trust-boundary hardening** (public, unauthenticated write — not
optional):
- zod schema validating rating range, message length, honeypot field
  (`companyWebsite` or similar hidden input — reject if non-empty).
- Per-IP rate limit: reject a second submission from the same IP within 60
  seconds. Storefront-2 is `force-dynamic` already (Phase 2), so
  `headers()`/`x-forwarded-for` is available; store last-submission
  timestamps in a small in-memory `Map` in the server action module
  (ponytail: process-local, resets on redeploy/cold-start, fine for a
  single-region low-traffic app — upgrade to a shared store like Upstash
  only if abuse actually shows up).

### `feedback.officialzella.com`

Add `feedback.officialzella.com` as a domain on the `storefront-2` Vercel
project. New `apps/storefront-2/src/proxy.ts` (storefront-2 currently has
none) rewrites requests where `hostname === "feedback.officialzella.com"`
to `/feedback` (root path only — `/` on that host serves the feedback
page; no need to proxy every path since it's a single-purpose subdomain).
Modeled on storefront-1's now-deleted A/B proxy's rewrite mechanics, minus
the coin flip and minus the cross-origin hop (this is a same-project,
same-origin path rewrite).

### Admin moderation: `/admin/feedback`

New `apps/admin/src/app/admin/feedback/page.tsx` + `actions.ts`: list
filtered by status (searchParam, same pattern as Phase 3 orders), each row
shows rating/name/message/orderNumber/date, Approve/Reject buttons
(`updateFeedbackStatus` server action, `requireAdmin()`-gated,
`revalidatePath` both `/admin/feedback` and the public `/feedback` page —
this one **is** same-project so `revalidatePath` works normally here,
unlike the Phase 2 cross-project problem). Dashboard (Phase 4) gets one
more tile: count of `PENDING` feedback, linking into
`/admin/feedback?status=PENDING`.

### Storefront display

- `/feedback` itself lists all `APPROVED` feedback (this phase's primary
  display surface).
- Homepage (`apps/storefront-2/src/app/page.tsx`) gets a testimonial strip:
  latest 3 `APPROVED` feedback, star rating + message + name (or
  "Verified customer" if name omitted). One new data call
  (`getApprovedFeedback(limit)` in the feedback module), rendered as a
  simple 3-card row consistent with the "Classical" editorial design
  already established (matted/plate treatment, serif headings) — match
  existing component patterns in `apps/storefront-2/src/components/`
  (e.g. `ProductPlate.tsx`) rather than inventing a new visual language.

## Testing

Per-phase, matching the repo's existing Vitest setup
(`packages/core`, `apps/admin`, `apps/storefront-*` each have
`vitest.config.ts`):

- Phase 2: a test asserting `catalog.ts` reads reflect a DB write without a
  rebuild is hard to unit-test meaningfully (it's a Next.js rendering-mode
  concern, not a function's return value) — verify manually post-deploy
  instead (edit a product in admin, confirm storefront-2 reflects it within
  one page load, no redeploy). Note this in the implementation plan as a
  manual verification step, not a Vitest case.
- Phase 3: unit tests for `buildOrderWhere()` (status/date/text combos),
  the CSV escaping helper, and `sendAdminOrderEmail`'s "no
  `ADMIN_NOTIFY_EMAIL`" and "no `RESEND_API_KEY`" no-throw paths (mirroring
  the existing `sendLoginPin` test pattern if one exists, else the
  `place-order.test.ts` mocking style).
- Phase 4: unit tests for the revenue/AOV aggregation math and the
  low-stock query's `lte: 3` boundary.
- Phase 5: unit tests for the feedback zod schema (rating bounds, honeypot
  rejection), the rate-limiter's 60s window, and
  `updateFeedbackStatus`'s `requireAdmin()` gate.

## Out of scope

- Admin's hardcoded `S`/`M`-only size list in
  `apps/admin/src/app/admin/products/actions.ts` (schema already supports
  XS–XL) — flagged to the user during brainstorming, explicitly deferred,
  not part of this spec.
- Any visual/copy redesign of storefront-2 beyond the Phase 1 parity gaps
  and the Phase 5 testimonial strip.
- Per-product feedback/reviews — explicitly declined ("starting small...
  will show all the feedbacks we get", site-wide only).
- A shared/distributed rate-limit store for feedback submissions (see
  ponytail note in Phase 5) — process-local is the agreed starting point.
