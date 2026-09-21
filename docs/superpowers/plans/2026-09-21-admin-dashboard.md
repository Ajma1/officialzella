# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace admin's three-counter dashboard with a real one: revenue/orders/AOV over a selectable range with a daily trend, best/worst sellers, low-stock/sold-out variants, and a status funnel that navigates into Phase 3's filtered order list.

**Architecture:** One rewritten Server Component (`apps/admin/src/app/admin/page.tsx`) reads a `range` searchParam and runs independent, sequential Prisma queries — each query feeds one dashboard section. Two small pure-function foundations sit underneath: `rangeToDates()` (range selector → date bounds) and a shop-timezone constant, both anchored to Pakistan Time (PKT, UTC+5, no DST) rather than the server's UTC clock — the final review on the previous phase flagged this exact gap in `buildOrderWhere()` and asked that this phase settle it, so this plan fixes it in both places from one shared source.

**Tech Stack:** Next.js 16 App Router, Prisma/Postgres, Vitest, Tailwind (no chart library — CSS width-based bars per the spec).

**Spec:** `docs/superpowers/specs/2026-09-21-single-storefront-admin-platform-design.md`, Phase 4. This plan assumes Phase 3 (`docs/superpowers/plans/2026-09-21-admin-order-tooling.md`) is merged — it links into `/admin/orders?status=X`, which only exists after that phase lands.

## Global Constraints

- **Base this work on `main` only after Phase 3's PR is merged** — `apps/admin/src/app/admin/orders/where.ts` must already exist (Task 1 modifies it).
- All dashboard date/range logic anchors to **PKT (UTC+5, fixed, no DST)** via the shared `SHOP_UTC_OFFSET` constant from Task 1 — never the server's local/UTC clock. This also retrofits Phase 3's `buildOrderWhere()`, which had the same gap.
- No chart library. Bars are CSS `width: %` divs, matching the spec and the pattern already used elsewhere in this codebase (native inputs over UI libraries, hand-rolled CSV over a package).
- Follow existing codebase patterns: Tailwind utility classes inline, `formatPrice`/`formatCents` from `@zella/core/format`.
- `apps/admin/src/app/admin/page.tsx` is expected to grow to ~250–350 lines by the end of this plan (four independent sections plus the existing counters and a range selector). This matches this codebase's existing single-file-per-route convention (`orders/[id]/page.tsx` is already ~200 lines) — it is not a signal to split into sub-components; this app has no such convention anywhere else.
- Every task after Task 3 **adds** a new query + a new JSX section to `page.tsx` without disturbing what's already there — each task's diff should be almost entirely additive.

---

### Task 1: Shop timezone constant + retrofit `buildOrderWhere`

**Files:**
- Create: `apps/admin/src/lib/shop-timezone.ts`
- Modify: `apps/admin/src/app/admin/orders/where.ts`
- Modify: `apps/admin/src/app/admin/orders/__tests__/where.test.ts`

**Interfaces:**
- Produces: `SHOP_UTC_OFFSET` (string, `"+05:00"`) and `shopDateKey(date: Date): string` (the PKT calendar date, `YYYY-MM-DD`, a UTC instant falls on) from `apps/admin/src/lib/shop-timezone.ts`. Task 2 imports `SHOP_UTC_OFFSET`; Task 3 imports `shopDateKey`.

- [ ] **Step 1: Create the shop timezone module**

```typescript
// apps/admin/src/lib/shop-timezone.ts
/** Zella operates out of Pakistan (PKT, UTC+5 year-round — no DST), so every
 *  "day boundary" in admin (order filters, dashboard date ranges) anchors to
 *  this fixed offset instead of the server's local clock (UTC on Vercel) —
 *  otherwise "today" means the server's today, not the shop's. */
export const SHOP_UTC_OFFSET = "+05:00";
const SHOP_UTC_OFFSET_MS = 5 * 60 * 60 * 1000;

/** The shop-local (PKT) calendar date a UTC instant falls on, as YYYY-MM-DD —
 *  used to bucket orders into daily totals. */
export function shopDateKey(date: Date): string {
  return new Date(date.getTime() + SHOP_UTC_OFFSET_MS).toISOString().slice(0, 10);
}
```

- [ ] **Step 2: Write the failing test for `shopDateKey`**

```typescript
// apps/admin/src/lib/__tests__/shop-timezone.test.ts
import { describe, it, expect } from "vitest";
import { shopDateKey } from "../shop-timezone";

describe("shopDateKey", () => {
  it("returns the same calendar date for a UTC instant well within the PKT day", () => {
    // 2026-09-10T10:00:00Z = 2026-09-10T15:00:00+05:00 — same PKT date.
    expect(shopDateKey(new Date("2026-09-10T10:00:00Z"))).toBe("2026-09-10");
  });

  it("rolls forward to the next PKT date for a late-UTC instant", () => {
    // 2026-09-10T20:00:00Z = 2026-09-11T01:00:00+05:00 — next PKT date.
    expect(shopDateKey(new Date("2026-09-10T20:00:00Z"))).toBe("2026-09-11");
  });

  it("rolls back to the previous PKT date for an early-UTC instant", () => {
    // 2026-09-10T02:00:00Z = 2026-09-10T07:00:00+05:00 — same PKT date, but
    // 2026-09-09T23:00:00Z = 2026-09-10T04:00:00+05:00 is still the 10th in
    // PKT despite being the 9th in UTC — the case this offset exists for.
    expect(shopDateKey(new Date("2026-09-09T23:00:00Z"))).toBe("2026-09-10");
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test -w @zella/admin -- shop-timezone`
Expected: FAIL — `Cannot find module '../shop-timezone'`.

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/admin -- shop-timezone`
Expected: PASS (3/3) — the module already exists from Step 1, so this confirms the logic is correct.

- [ ] **Step 5: Retrofit `buildOrderWhere` to use the shop offset**

Read `apps/admin/src/app/admin/orders/where.ts` first to confirm it still matches. Add the import:
```typescript
import { SHOP_UTC_OFFSET } from "@/lib/shop-timezone";
```

Replace:
```typescript
  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(`${params.from}T00:00:00`);
    if (params.to) where.createdAt.lte = new Date(`${params.to}T23:59:59`);
  }
```
with:
```typescript
  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(`${params.from}T00:00:00${SHOP_UTC_OFFSET}`);
    if (params.to) where.createdAt.lte = new Date(`${params.to}T23:59:59${SHOP_UTC_OFFSET}`);
  }
```

- [ ] **Step 6: Update the two existing tests that assert on the old (offset-less) dates**

In `apps/admin/src/app/admin/orders/__tests__/where.test.ts`, replace:
```typescript
  it("builds a date range from from/to", () => {
    const where = buildOrderWhere({ from: "2026-09-01", to: "2026-09-20" });
    expect(where.createdAt).toEqual({
      gte: new Date("2026-09-01T00:00:00"),
      lte: new Date("2026-09-20T23:59:59"),
    });
  });

  it("builds an open-ended range from just `from`", () => {
    const where = buildOrderWhere({ from: "2026-09-01" });
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00") });
  });
```
with:
```typescript
  it("builds a date range from from/to", () => {
    const where = buildOrderWhere({ from: "2026-09-01", to: "2026-09-20" });
    expect(where.createdAt).toEqual({
      gte: new Date("2026-09-01T00:00:00+05:00"),
      lte: new Date("2026-09-20T23:59:59+05:00"),
    });
  });

  it("builds an open-ended range from just `from`", () => {
    const where = buildOrderWhere({ from: "2026-09-01" });
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00+05:00") });
  });
```

And in the "combines status, date range, and search together" test, replace:
```typescript
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00") });
```
with:
```typescript
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00+05:00") });
```

- [ ] **Step 7: Run the full where.test.ts to confirm it still passes**

Run: `npm run test -w @zella/admin -- where`
Expected: PASS (8/8).

- [ ] **Step 8: Run the full admin suite to confirm nothing else broke**

Run: `npm run test -w @zella/admin`
Expected: all pass (22 = 19 pre-existing + 3 new shop-timezone tests).

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/lib/shop-timezone.ts apps/admin/src/lib/__tests__/shop-timezone.test.ts apps/admin/src/app/admin/orders/where.ts apps/admin/src/app/admin/orders/__tests__/where.test.ts
git commit -m "fix(admin): anchor date-range filtering to PKT instead of server UTC

buildOrderWhere's from/to parsed as server-local time (UTC on Vercel), so
a filter for 'today' in Pakistan (UTC+5) was off by up to 5 hours. Adds a
shared SHOP_UTC_OFFSET the dashboard (this plan) also builds on.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: `rangeToDates()` — dashboard range selector → date bounds

**Files:**
- Create: `apps/admin/src/app/admin/dashboard-range.ts`
- Test: `apps/admin/src/app/admin/__tests__/dashboard-range.test.ts`

**Interfaces:**
- Consumes: `SHOP_UTC_OFFSET` from `@/lib/shop-timezone` (Task 1).
- Produces: `DashboardRange` (`"today" | "7d" | "30d" | "all"`) and `rangeToDates(range: DashboardRange, now?: Date): { start: Date | null; end: Date | null }`, from `./dashboard-range` relative to `apps/admin/src/app/admin/`. Task 3 imports both.

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/admin/src/app/admin/__tests__/dashboard-range.test.ts
import { describe, it, expect } from "vitest";
import { rangeToDates } from "../dashboard-range";

// Fixed reference instant: 2026-09-21T10:00:00Z = 2026-09-21T15:00:00+05:00 (PKT).
const NOW = new Date("2026-09-21T10:00:00Z");

describe("rangeToDates", () => {
  it("'today' starts at shop-local midnight of the current PKT day", () => {
    const { start, end } = rangeToDates("today", NOW);
    expect(start).toEqual(new Date("2026-09-21T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'7d' starts 6 days before shop-local midnight (7-day inclusive window)", () => {
    const { start, end } = rangeToDates("7d", NOW);
    expect(start).toEqual(new Date("2026-09-15T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'30d' starts 29 days before shop-local midnight (30-day inclusive window)", () => {
    const { start, end } = rangeToDates("30d", NOW);
    expect(start).toEqual(new Date("2026-08-23T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'all' has no date bound", () => {
    expect(rangeToDates("all", NOW)).toEqual({ start: null, end: null });
  });

  it("'today' rolls to the correct PKT date even when UTC is still the previous day", () => {
    // 2026-09-21T20:00:00Z = 2026-09-22T01:00:00+05:00 — PKT date is the 22nd.
    const lateUtc = new Date("2026-09-21T20:00:00Z");
    const { start } = rangeToDates("today", lateUtc);
    expect(start).toEqual(new Date("2026-09-22T00:00:00+05:00"));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -w @zella/admin -- dashboard-range`
Expected: FAIL — `Cannot find module '../dashboard-range'`.

- [ ] **Step 3: Write the implementation**

```typescript
// apps/admin/src/app/admin/dashboard-range.ts
import { SHOP_UTC_OFFSET } from "@/lib/shop-timezone";

export type DashboardRange = "today" | "7d" | "30d" | "all";

const DAYS_BACK: Record<Exclude<DashboardRange, "all">, number> = {
  today: 0,
  "7d": 6,
  "30d": 29,
};

/** Converts a dashboard range selector into UTC instant bounds, anchored to
 *  the shop's PKT calendar day (not the server's UTC day) — "today" means
 *  the shop's today. `end` is always null (open-ended through now); "all"
 *  returns both bounds null (no date filter at all). `now` is injectable
 *  for tests; defaults to the real current time. */
export function rangeToDates(
  range: DashboardRange,
  now: Date = new Date(),
): { start: Date | null; end: Date | null } {
  if (range === "all") return { start: null, end: null };

  const shopUtcOffsetMs = 5 * 60 * 60 * 1000;
  const shopToday = new Date(now.getTime() + shopUtcOffsetMs).toISOString().slice(0, 10);

  const start = new Date(`${shopToday}T00:00:00${SHOP_UTC_OFFSET}`);
  start.setUTCDate(start.getUTCDate() - DAYS_BACK[range]);

  return { start, end: null };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/admin -- dashboard-range`
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/dashboard-range.ts apps/admin/src/app/admin/__tests__/dashboard-range.test.ts
git commit -m "feat(admin): add rangeToDates — dashboard range selector to PKT date bounds

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Dashboard skeleton — range selector, existing counters, revenue/orders/AOV, daily trend

**Files:**
- Modify: `apps/admin/src/app/admin/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `rangeToDates`, `DashboardRange` from `./dashboard-range` (Task 2); `shopDateKey` from `@/lib/shop-timezone` (Task 1); `formatPrice` from `@zella/core/format`.
- Produces: nothing consumed by other tasks in code, but Tasks 4–6 each insert a new section into this same file, after the daily-trend block and before the closing `</div>` of the page's root element. Each of those tasks reads this file first to find that exact insertion point.

This is the first of four tasks that build `page.tsx` incrementally. This task establishes the file's overall shape: the range selector, the three pre-existing counters (unchanged), then the new revenue/orders/AOV tiles and daily trend bars. Tasks 4–6 each append one more self-contained section.

- [ ] **Step 1: Read the current file**

`apps/admin/src/app/admin/page.tsx` — confirm it still matches the three-counter version (Products / Pending orders / Total orders, no `searchParams`). If it has diverged, stop and report BLOCKED.

- [ ] **Step 2: Replace the file**

```typescript
// apps/admin/src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@zella/db";
import { formatPrice } from "@zella/core/format";
import { rangeToDates, type DashboardRange } from "./dashboard-range";
import { shopDateKey } from "@/lib/shop-timezone";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

function isValidRange(value: string | undefined): value is DashboardRange {
  return RANGES.some((r) => r.value === value);
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: DashboardRange = isValidRange(rawRange) ? rawRange : "7d";
  const { start } = rangeToDates(range);

  const [activeProductCount, pendingOrders, totalOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
  ]);

  const cards = [
    { label: "Products", value: activeProductCount, href: "/admin/products" },
    { label: "Pending orders", value: pendingOrders, href: "/admin/orders" },
    { label: "Total orders", value: totalOrders, href: "/admin/orders" },
  ];

  // Revenue/orders/AOV + daily trend, scoped to the selected range.
  // ponytail: sequential Postgres reads over one small table — every query
  // on this page could run in parallel via Promise.all, but at this order
  // volume the latency difference is imperceptible, and sequential awaits
  // keep each task's diff a plain insertion. Revisit if this page ever
  // feels slow.
  const rangeOrders = await prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(start ? { createdAt: { gte: start } } : {}),
    },
    select: { totalCents: true, createdAt: true },
  });

  const revenueCents = rangeOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const orderCount = rangeOrders.length;
  const aovCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

  // Daily trend only makes sense for bounded ranges — an "all time" list of
  // daily bars could span years and isn't a meaningful visualization.
  const dailyTrend =
    range === "all"
      ? []
      : (() => {
          const buckets = new Map<string, number>();
          for (const o of rangeOrders) {
            const key = shopDateKey(o.createdAt);
            buckets.set(key, (buckets.get(key) ?? 0) + o.totalCents);
          }
          return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
        })();
  const maxDayRevenue = Math.max(0, ...dailyTrend.map(([, cents]) => cents));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/admin?range=${r.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                range === r.value
                  ? "bg-cherry text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-cherry/40"
          >
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Revenue</p>
          <p className="mt-1 text-3xl font-semibold">{formatPrice(revenueCents)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Orders</p>
          <p className="mt-1 text-3xl font-semibold">{orderCount}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Average order value</p>
          <p className="mt-1 text-3xl font-semibold">{formatPrice(aovCents)}</p>
        </div>
      </div>

      {dailyTrend.length > 0 && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Daily revenue</h2>
          <div className="mt-4 space-y-2">
            {dailyTrend.map(([date, cents]) => {
              const pct = maxDayRevenue > 0 ? (cents / maxDayRevenue) * 100 : 0;
              return (
                <div key={date} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 text-neutral-500 tabular-nums">
                    {date.slice(5)}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-neutral-100">
                    <div
                      className="h-2 rounded-full bg-cherry"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right tabular-nums">
                    {formatPrice(cents)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

No dedicated test for this task — it's a Server Component composing already-tested logic (`rangeToDates`, `shopDateKey`) with Prisma and JSX, matching this codebase's existing no-page-tests convention (see `orders/page.tsx`, `orders/[id]/page.tsx`).

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/admin/page.tsx
git commit -m "feat(admin): dashboard range selector, revenue/orders/AOV, daily trend

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Best & worst sellers

**Files:**
- Modify: `apps/admin/src/app/admin/page.tsx`

**Interfaces:**
- Produces: nothing consumed by other tasks.

**Note on the aggregation approach:** the spec's Phase 4 section suggests `prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true, priceCents: true } })`, but `OrderItem.priceCents` is a **per-unit** price (see `packages/core/src/actions/place-order.ts` — `priceCents: product.priceCents` is set once per line, independent of `quantity`), so summing `priceCents` directly across rows undercounts revenue for any line with `quantity > 1`. This task instead fetches matching `OrderItem` rows and aggregates `priceCents * quantity` in JS — still one query, still simple, but correct.

- [ ] **Step 1: Read the current file**

`apps/admin/src/app/admin/page.tsx` (as left by Task 3) — confirm the `dailyTrend`/`maxDayRevenue` block and the closing JSX structure still match, so you know exactly where to insert the new query and section.

- [ ] **Step 2: Add the query**

Insert after the `maxDayRevenue` line (still inside the function, before the `return`):

```typescript
  // Best/worst sellers, scoped to the same range and non-cancelled orders.
  const rangeItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { not: "CANCELLED" },
        ...(start ? { createdAt: { gte: start } } : {}),
      },
    },
    select: { productId: true, quantity: true, priceCents: true, product: { select: { name: true } } },
  });

  const sellerTotals = new Map<string, { name: string; units: number; revenueCents: number }>();
  for (const item of rangeItems) {
    const entry = sellerTotals.get(item.productId) ?? {
      name: item.product.name,
      units: 0,
      revenueCents: 0,
    };
    entry.units += item.quantity;
    entry.revenueCents += item.priceCents * item.quantity;
    sellerTotals.set(item.productId, entry);
  }
  const rankedSellers = [...sellerTotals.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.units - a.units);
  const topSellers = rankedSellers.slice(0, 5);
  const worstSellers = [...rankedSellers].reverse().slice(0, 5);
```

- [ ] **Step 3: Add the section**

Insert this new section right after the `{dailyTrend.length > 0 && (...)}` block, still before the final closing `</div>` of the page:

```typescript
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Best sellers</h2>
          {topSellers.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No sales in this range.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {topSellers.map((s, i) => (
                <li key={s.productId} className="flex items-center justify-between gap-3">
                  <span className="truncate">
                    {i + 1}. {s.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-600">
                    {s.units} units · {formatPrice(s.revenueCents)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Worst sellers</h2>
          {worstSellers.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No sales in this range.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {worstSellers.map((s, i) => (
                <li key={s.productId} className="flex items-center justify-between gap-3">
                  <span className="truncate">
                    {i + 1}. {s.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-600">
                    {s.units} units · {formatPrice(s.revenueCents)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
```

(Note: a product with zero sales in the range never appears in `OrderItem`, so it can't surface as a "worst seller" here — this ranks among products that sold *something*. A separate, more direct signal for slow-moving stock is Task 5's low-stock section.)

- [ ] **Step 4: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

No dedicated test (Server Component + JSX, same reasoning as Task 3).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/page.tsx
git commit -m "feat(admin): add best/worst sellers to the dashboard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Low stock / sold-out

**Files:**
- Modify: `apps/admin/src/app/admin/page.tsx`

**Interfaces:**
- Produces: nothing consumed by other tasks.

This section is **not** scoped to the date range — stock is a live snapshot, not a time-series measure, matching how the existing "Pending orders" counter also ignores the range.

- [ ] **Step 1: Read the current file**

`apps/admin/src/app/admin/page.tsx` (as left by Task 4) — confirm the seller-ranking block and JSX still match.

- [ ] **Step 2: Add the query**

Insert after the `worstSellers` line:

```typescript
  // Low stock / sold-out — a live snapshot, not scoped to the date range.
  const lowStockVariants = await prisma.productVariant.findMany({
    where: { stock: { lte: 3 } },
    include: { product: { select: { id: true, name: true } } },
    orderBy: { stock: "asc" },
  });

  const lowStockByProduct = new Map<
    string,
    { name: string; variants: { size: string; stock: number }[] }
  >();
  for (const v of lowStockVariants) {
    const entry = lowStockByProduct.get(v.product.id) ?? { name: v.product.name, variants: [] };
    entry.variants.push({ size: v.size, stock: v.stock });
    lowStockByProduct.set(v.product.id, entry);
  }
  const lowStockList = [...lowStockByProduct.values()];
```

- [ ] **Step 3: Add the section**

Insert after the best/worst sellers `<div className="mt-6 grid ...">...</div>` block from Task 4:

```typescript
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Low stock</h2>
        {lowStockList.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Nothing low on stock.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {lowStockList.map((p, i) => (
              <div key={i}>
                <p className="text-sm font-medium">{p.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {p.variants.map((v) => (
                    <span
                      key={v.size}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {v.size}: {v.stock === 0 ? "sold out" : `${v.stock} left`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
```

- [ ] **Step 4: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

No dedicated test (Server Component + JSX, same reasoning as Task 3).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/page.tsx
git commit -m "feat(admin): add low-stock/sold-out variants to the dashboard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Order status funnel

**Files:**
- Modify: `apps/admin/src/app/admin/page.tsx`

**Interfaces:**
- Produces: nothing consumed by other tasks. This is the last content section — after this task, Task 7 is verification only.

This section counts orders by status **within the selected range** (unlike Task 5's stock snapshot, a status breakdown over time is meaningful) and each count links into Phase 3's filtered order list.

- [ ] **Step 1: Read the current file**

`apps/admin/src/app/admin/page.tsx` (as left by Task 5) — confirm the low-stock block and JSX still match, so you know exactly where to insert the new query and section.

- [ ] **Step 2: Add the query**

Insert after the `lowStockList` line. Add `OrderStatus` to the existing `@zella/db` import at the top of the file (change `import { prisma } from "@zella/db";` to `import { prisma, OrderStatus } from "@zella/db";`):

```typescript
  // Status funnel — counts within the selected range (unlike stock, a time
  // breakdown here is meaningful), each linking into Phase 3's filtered list.
  const funnelCounts = await prisma.order.groupBy({
    by: ["status"],
    where: start ? { createdAt: { gte: start } } : {},
    _count: true,
  });
  const funnelByStatus = new Map(funnelCounts.map((f) => [f.status, f._count]));
  const STATUS_ORDER: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];
```

- [ ] **Step 3: Add the section**

Use the exact same status color classes as `orders/page.tsx`'s `STATUS_STYLES` (read that file's current values and substitute them below — do not guess). Insert after the low-stock `<div>` block from Task 5:

```typescript
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Order status</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_ORDER.map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="rounded-lg border border-neutral-200 p-3 text-center transition-colors hover:border-cherry/40"
            >
              <p className="text-2xl font-semibold">{funnelByStatus.get(status) ?? 0}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {status.replaceAll("_", " ").toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </div>
```

(This deliberately uses a neutral border/hover style rather than each status's own background color — the color-coded pill style from `orders/page.tsx`'s list rows would compete visually with five cards in a row here. Use the code above as written; it is the final decision, not a starting point.)

- [ ] **Step 4: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

No dedicated test (Server Component + JSX, same reasoning as Task 3).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/page.tsx
git commit -m "feat(admin): add order status funnel, linking into the filtered order list

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Full verification

**Files:** none.

**Interfaces:**
- Consumes: all prior tasks' commits.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test -w @zella/core -w @zella/admin -w @zella/storefront-1 -w @zella/storefront-2`
Expected: all pass — `@zella/admin` should be at 27 (19 pre-existing from Phase 3 + 3 shop-timezone + 5 dashboard-range), `@zella/core` unaffected by this plan, storefront-1/2 unaffected.

- [ ] **Step 2: Run the admin build**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

- [ ] **Step 3: Manual post-deploy checklist (for the user, after this plan's branch is merged and deployed)**

- Load `/admin` with each range (Today / 7 days / 30 days / All time); confirm the tiles and daily trend update, and that "All time" hides the daily trend (by design).
- Confirm the daily trend bars' relative widths look right — the longest bar should be the highest-revenue day in the range.
- Confirm best/worst sellers show real product names and reasonable unit/revenue numbers.
- Confirm low stock correctly flags any variant at 0 as "sold out" (red) and others at ≤3 as amber.
- Click a status funnel count and confirm it lands on `/admin/orders` pre-filtered to that status.
- Spot-check the PKT date-boundary fix: place a test order late in the day (Pakistan time) and confirm it lands in "Today," not "yesterday."

No commit for this task — verification only.
