# Admin Order Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admin real order tooling — status/date/search filtering, size+SKU+product-link on every order line, a printable packing slip, a CSV export that matches the current filter, and email notifications to the shop owner on order placed/cancelled.

**Architecture:** A pure `buildOrderWhere()` helper (no DB, no auth) is the single source of truth for "which orders match the current filter" — the orders list page, the CSV export route, and (later, Phase 4) the dashboard's status-funnel links all build on it. Order-event emails go through one new function, `sendAdminOrderEmail()`, added next to the existing `sendLoginPin()` in `packages/core/src/email.ts`, called from the three places an order's fate changes: `place-order.ts` (placed), `account.ts`'s `cancelOrder` (cancelled by customer), and admin's `orders/actions.ts`'s `updateOrderStatus` (cancelled by admin). Every call site wraps the email in `try/catch` — a notification failure must never fail the checkout, cancellation, or status update that triggered it.

**Tech Stack:** Next.js 16 App Router, Prisma/Postgres, Vitest, Resend (already a dependency of `@zella/core`).

**Spec:** `docs/superpowers/specs/2026-09-21-single-storefront-admin-platform-design.md`, Phase 3. This plan implements only Phase 3 — Phase 4 (dashboard) and Phase 5 (feedback) get their own plans later, though Phase 4's design already assumes Phase 3's `buildOrderWhere()` and order list exist.

## Global Constraints

- **`RESEND_API_KEY` in this environment is a live key**, confirmed in this session — the domain `officialzella.com` is verified in Resend. **Every test that exercises a code path calling `sendAdminOrderEmail` MUST mock the email module** (`vi.mock("../../email", ...)` from `packages/core/src/actions/__tests__/`, or `vi.mock("@zella/core/email", ...)` from `apps/admin/src/**/__tests__/`). An unmocked test would send a real email. This is non-negotiable — check every test file this plan touches for a mock before running it.
- `sendAdminOrderEmail` itself must never throw (catches internally); every call site additionally wraps its call in `try/catch` as defense-in-depth, per the spec.
- CSV export must query with the exact same `buildOrderWhere()` result the list page used — never a second, hand-rolled filter.
- `ADMIN_NOTIFY_EMAIL` (new env var, value `jedi.raza007@gmail.com`) goes on the `admin` and `storefront-2` Vercel projects' Production env only — not storefront-1 (no longer public-facing).
- Follow existing codebase patterns: Tailwind utility classes inline (no component library), `formatCents`/`formatPrice` from `@zella/core/format`, Prisma tests hit a real Postgres DB directly (no DB mocking) — only `next/cache`, `next/headers`, `@/lib/auth`, and the email module get `vi.mock`'d.

---

### Task 1: Set `ADMIN_NOTIFY_EMAIL` on Vercel

**Files:** none — Vercel project configuration only.

**Interfaces:**
- Produces: `process.env.ADMIN_NOTIFY_EMAIL` available at runtime on `admin` and `storefront-2`'s Production deployments. Tasks 7–9's code reads this; its absence is handled gracefully (no-op, not a crash) so no task is blocked waiting on this landing first, but it should land before this plan's branch deploys to production.

- [ ] **Step 1: Set the env var on the `admin` project**

Call `mcp__plugin_vercel_vercel__create_project_env` with:
```json
{
  "idOrName": "prj_XfiwgN0sjmmsgwO1KbfeTHYYvvpb",
  "teamId": "team_FNXDRQmNqxqAQC59LcBw34Kf",
  "upsert": "true",
  "requestBody": {
    "key": "ADMIN_NOTIFY_EMAIL",
    "value": "jedi.raza007@gmail.com",
    "type": "sensitive",
    "target": ["production"]
  }
}
```

- [ ] **Step 2: Set the env var on the `storefront-2` project**

Same call with `"idOrName": "prj_gpJCIKv3SDlmI74HCizMM1HSzJE0"`.

- [ ] **Step 3: Verify both**

Call `mcp__plugin_vercel_vercel__filter_project_envs` for each project id and confirm `ADMIN_NOTIFY_EMAIL` is listed with `target: ["production"]`.

No commit — infrastructure state, not code.

---

### Task 2: `buildOrderWhere()` — the shared order filter

**Files:**
- Create: `apps/admin/src/app/admin/orders/where.ts`
- Test: `apps/admin/src/app/admin/orders/__tests__/where.test.ts`

**Interfaces:**
- Produces: `buildOrderWhere(params: OrderSearchParams): Prisma.OrderWhereInput` and the `OrderSearchParams` type (`{ status?: string; from?: string; to?: string; q?: string }`). Tasks 3 and 4 both import these exact names from `../where` (Task 3) and `../where`/`./where` (Task 4, one directory deeper for the export route — confirm relative path when writing that task).

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/admin/src/app/admin/orders/__tests__/where.test.ts
import { describe, it, expect } from "vitest";
import { buildOrderWhere } from "../where";

describe("buildOrderWhere", () => {
  it("returns an empty where for no params", () => {
    expect(buildOrderWhere({})).toEqual({});
  });

  it("filters by a valid status", () => {
    expect(buildOrderWhere({ status: "PENDING" })).toEqual({ status: "PENDING" });
  });

  it("ignores an invalid status value", () => {
    expect(buildOrderWhere({ status: "NOT_A_STATUS" })).toEqual({});
  });

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

  it("builds a case-insensitive OR search across order number, name, phone, email", () => {
    const where = buildOrderWhere({ q: "Ava" });
    expect(where.OR).toEqual([
      { orderNumber: { contains: "Ava", mode: "insensitive" } },
      { customerName: { contains: "Ava", mode: "insensitive" } },
      { customerPhone: { contains: "Ava", mode: "insensitive" } },
      { customerEmail: { contains: "Ava", mode: "insensitive" } },
    ]);
  });

  it("trims whitespace from q and ignores an empty/whitespace-only search", () => {
    expect(buildOrderWhere({ q: "   " })).toEqual({});
  });

  it("combines status, date range, and search together", () => {
    const where = buildOrderWhere({ status: "CONFIRMED", from: "2026-09-01", q: "test" });
    expect(where.status).toBe("CONFIRMED");
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00") });
    expect(where.OR).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -w @zella/admin -- where`
Expected: FAIL — `Cannot find module '../where'`.

- [ ] **Step 3: Write the implementation**

```typescript
// apps/admin/src/app/admin/orders/where.ts
import type { Prisma } from "@zella/db";
import { OrderStatus } from "@zella/db";

export interface OrderSearchParams {
  status?: string;
  from?: string;
  to?: string;
  q?: string;
}

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

/** Single source of truth for "which orders match the current filter" —
 *  used by the orders list page and the CSV export, so what you see on
 *  screen and what you download can never drift apart. */
export function buildOrderWhere(params: OrderSearchParams): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (params.status && VALID_STATUSES.has(params.status)) {
    where.status = params.status as OrderStatus;
  }

  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(`${params.from}T00:00:00`);
    if (params.to) where.createdAt.lte = new Date(`${params.to}T23:59:59`);
  }

  const q = params.q?.trim();
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      { customerEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/admin -- where`
Expected: PASS (8/8).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/orders/where.ts apps/admin/src/app/admin/orders/__tests__/where.test.ts
git commit -m "feat(admin): add buildOrderWhere — shared filter for order list and CSV export

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Orders list page — status/date/search filtering

**Files:**
- Modify: `apps/admin/src/app/admin/orders/page.tsx` (full rewrite — current file is ~65 lines with no filtering; read it first to confirm it still matches what's below before overwriting)

**Interfaces:**
- Consumes: `buildOrderWhere`, `OrderSearchParams` from `./where` (Task 2).
- Produces: nothing consumed by other tasks directly, but Task 4's CSV export link (`/admin/orders/export?...`) must read the exact same query-string shape this page builds — both derive it from the same `OrderSearchParams`.

- [ ] **Step 1: Read the current file**

`apps/admin/src/app/admin/orders/page.tsx` — confirm it still matches the version this task assumes (a `STATUS_STYLES` map, an async `OrdersPage` with no params, a `prisma.order.findMany` with no `where`). If it has diverged, stop and report — don't guess at a merge.

- [ ] **Step 2: Replace the file with the filtered version**

```typescript
// apps/admin/src/app/admin/orders/page.tsx
import Link from "next/link";
import { prisma } from "@zella/db";
import { formatCents } from "@zella/core/format";
import { OrderStatus } from "@zella/db";
import { buildOrderWhere, type OrderSearchParams } from "./where";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function toQueryString(params: OrderSearchParams): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderSearchParams>;
}) {
  const params = await searchParams;
  const hasFilters = Boolean(params.status || params.from || params.to || params.q);

  const orders = await prisma.order.findMany({
    where: buildOrderWhere(params),
    orderBy: { createdAt: "desc" },
    include: { address: true, items: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        <a
          href={`/admin/orders/export${toQueryString(params)}`}
          className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
        >
          Export CSV
        </a>
      </div>

      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-neutral-500">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={params.q ?? ""}
            placeholder="Order #, name, phone, email"
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs font-medium text-neutral-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ").toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs font-medium text-neutral-500">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={params.from ?? ""}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs font-medium text-neutral-500">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={params.to ?? ""}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-lg bg-cherry px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/admin/orders"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Clear
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          {hasFilters
            ? "No orders match these filters."
            : "No orders yet — they’ll show up here once checkout is live."}
        </p>
      ) : (
        <div className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {order.customerName}{" "}
                  <span className="font-normal text-neutral-400">
                    {order.orderNumber}
                  </span>
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {order.address.city}
                  {order.address.state ? `, ${order.address.state}` : ""} ·{" "}
                  {order.items.length} item
                  {order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                COD
              </span>
              <p className="text-sm tabular-nums text-neutral-700">
                {formatCents(order.totalCents)}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500"}`}
              >
                {order.status.replaceAll("_", " ").toLowerCase()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

No dedicated test for this page — it's a Server Component composing already-tested `buildOrderWhere` with Prisma and JSX; the repo's existing convention (see `orders/page.tsx`'s predecessor, `orders/[id]/page.tsx`) doesn't unit-test pages, only the pure logic they call.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/admin/orders/page.tsx
git commit -m "feat(admin): add status/date/search filtering to the orders list

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: CSV export

**Files:**
- Create: `apps/admin/src/lib/csv.ts`
- Test: `apps/admin/src/lib/__tests__/csv.test.ts`
- Create: `apps/admin/src/app/admin/orders/export/route.ts`

**Interfaces:**
- Consumes: `buildOrderWhere`, `OrderSearchParams` from `../where` (Task 2 — one directory up from `orders/export/`).
- Produces: `escapeCsvField`, `toCsvRow` from `apps/admin/src/lib/csv.ts` — reusable if a future CSV export is added elsewhere, but nothing else in this plan consumes them.

- [ ] **Step 1: Write the failing tests for the CSV helper**

```typescript
// apps/admin/src/lib/__tests__/csv.test.ts
import { describe, it, expect } from "vitest";
import { escapeCsvField, toCsvRow } from "../csv";

describe("escapeCsvField", () => {
  it("returns a plain value unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("quotes a value containing a comma", () => {
    expect(escapeCsvField("Lahore, Punjab")).toBe('"Lahore, Punjab"');
  });

  it("quotes and doubles embedded quotes", () => {
    expect(escapeCsvField('She said "hi"')).toBe('"She said ""hi"""');
  });

  it("quotes a value containing a newline", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsvRow", () => {
  it("joins fields with commas, escaping as needed", () => {
    expect(toCsvRow(["a", "b, c", "d"])).toBe('a,"b, c",d');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -w @zella/admin -- csv`
Expected: FAIL — `Cannot find module '../csv'`.

- [ ] **Step 3: Write the CSV helper**

```typescript
// apps/admin/src/lib/csv.ts
/** Escapes a single CSV field per RFC 4180: wraps in quotes and doubles
 *  any embedded quotes whenever the value contains a comma, quote, or
 *  newline. */
export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/admin -- csv`
Expected: PASS (5/5).

- [ ] **Step 5: Write the export route (no dedicated test — thin glue over already-tested `buildOrderWhere` and `toCsvRow`; the repo has no precedent for testing `requireAdmin()`-gated route handlers, and inventing that scaffolding isn't in this plan's scope)**

```typescript
// apps/admin/src/app/admin/orders/export/route.ts
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@zella/db";
import { formatCents } from "@zella/core/format";
import { buildOrderWhere, type OrderSearchParams } from "../where";
import { toCsvRow } from "@/lib/csv";

const HEADER = [
  "Order number",
  "Date",
  "Status",
  "Customer name",
  "Phone",
  "Email",
  "City",
  "Item count",
  "Total",
  "Discount",
];

export async function GET(request: NextRequest) {
  await requireAdmin();

  const url = new URL(request.url);
  const params: OrderSearchParams = {
    status: url.searchParams.get("status") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  };

  const orders = await prisma.order.findMany({
    where: buildOrderWhere(params),
    orderBy: { createdAt: "desc" },
    include: { address: true, items: true },
  });

  const rows = [
    toCsvRow(HEADER),
    ...orders.map((order) =>
      toCsvRow([
        order.orderNumber,
        order.createdAt.toISOString(),
        order.status,
        order.customerName,
        order.customerPhone,
        order.customerEmail ?? "",
        order.address.city,
        String(order.items.length),
        formatCents(order.totalCents),
        formatCents(order.discountCents),
      ]),
    ),
  ];

  const csv = rows.join("\r\n") + "\r\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
```

- [ ] **Step 6: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/lib/csv.ts apps/admin/src/lib/__tests__/csv.test.ts apps/admin/src/app/admin/orders/export/route.ts
git commit -m "feat(admin): add CSV export for orders, matching the active filter

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Order detail — size/SKU/product link + packing slip

**Files:**
- Modify: `apps/admin/src/app/admin/orders/[id]/page.tsx`
- Modify: `apps/admin/src/app/globals.css` (add one `@media print` rule)
- Create: `apps/admin/src/app/admin/orders/[id]/slip/page.tsx`
- Create: `apps/admin/src/app/admin/orders/[id]/slip/PrintButton.tsx`

**Interfaces:**
- Produces: nothing consumed by other tasks in this plan. Phase 4 (dashboard, future plan) does not touch this page.

- [ ] **Step 1: Read the current order detail file**

`apps/admin/src/app/admin/orders/[id]/page.tsx` — confirm the `groupOrderItems` helper, the `OrderItemWithProduct` type, and the two rendering branches (paired / non-paired) still match. If diverged, stop and report.

- [ ] **Step 2: Add a reusable line-item renderer, and use it in both branches**

Add this function above `OrderDetailPage` (after the `groupOrderItems` function, before the default export):

```typescript
function OrderLineFields({ item }: { item: OrderItemWithProduct }) {
  return (
    <>
      <span>
        <Link
          href={`/admin/products/${item.productId}/edit`}
          className="font-medium text-neutral-900 hover:text-cherry hover:underline"
        >
          {item.product.name}
        </Link>{" "}
        <span className="text-neutral-500">
          ({item.product.sku} · {item.size}) × {item.quantity}
        </span>
      </span>
      <span className="tabular-nums text-neutral-600">
        {formatCents(item.priceCents * item.quantity)}
      </span>
    </>
  );
}
```

Add `import Link from "next/link";` to the top of the file (it isn't currently imported there — check first; if it already is, don't duplicate).

Replace the paired-outfit branch's item row:
```typescript
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="tabular-nums text-neutral-600">
                        {formatCents(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
```
with:
```typescript
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <OrderLineFields item={item} />
                    </div>
                  ))}
```

Replace the non-paired branch's item row:
```typescript
              group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="tabular-nums text-neutral-600">
                    {formatCents(item.priceCents * item.quantity)}
                  </span>
                </div>
              ))
```
with:
```typescript
              group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <OrderLineFields item={item} />
                </div>
              ))
```

- [ ] **Step 3: Add the order ID and a packing-slip link near the header**

Replace:
```typescript
      <h1 className="text-xl font-semibold">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Placed {order.createdAt.toLocaleString()}
      </p>
```
with:
```typescript
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Placed {order.createdAt.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">ID: {order.id}</p>
        </div>
        <Link
          href={`/admin/orders/${order.id}/slip`}
          className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
        >
          Packing slip
        </Link>
      </div>
```

- [ ] **Step 4: Verify the modified page builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors.

- [ ] **Step 5: Add the print-hide rule to globals.css**

Append to `apps/admin/src/app/globals.css`:
```css
/* Packing slip pages (apps/admin/src/app/admin/orders/[id]/slip) nest under
   this app's shared header via admin/layout.tsx — hide it only when
   printing, so the on-screen view keeps its nav but the printed slip
   doesn't carry admin chrome. */
@media print {
  header {
    display: none;
  }
}
```

- [ ] **Step 6: Create the print button (client component)**

```typescript
// apps/admin/src/app/admin/orders/[id]/slip/PrintButton.tsx
"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center rounded-lg bg-cherry px-4 text-sm font-semibold text-white hover:opacity-90 print:hidden"
    >
      Print
    </button>
  );
}
```

- [ ] **Step 7: Create the packing slip page**

```typescript
// apps/admin/src/app/admin/orders/[id]/slip/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@zella/db";
import { formatCents } from "@zella/core/format";
import PrintButton from "./PrintButton";

export default async function PackingSlipPage({
  params,
}: PageProps<"/admin/orders/[id]/slip">) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl bg-white p-8 text-neutral-900">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">Packing slip — {order.orderNumber}</h1>
        <PrintButton />
      </div>

      <div className="mb-6">
        <p className="font-display text-2xl">Zella</p>
        <p className="text-sm text-neutral-500">Order {order.orderNumber}</p>
        <p className="text-sm text-neutral-500">{order.createdAt.toLocaleDateString()}</p>
      </div>

      <div className="mb-6 border-t border-neutral-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Deliver to
        </p>
        <p className="mt-1 text-sm">{order.address.fullName}</p>
        <p className="text-sm">{order.address.phone}</p>
        <p className="text-sm">
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}
        </p>
        <p className="text-sm">
          {order.address.city}
          {order.address.state ? `, ${order.address.state}` : ""}{" "}
          {order.address.postalCode ?? ""}
        </p>
        <p className="text-sm">{order.address.country}</p>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Items</p>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500">
              <th className="py-1">Item</th>
              <th className="py-1">SKU</th>
              <th className="py-1">Size</th>
              <th className="py-1 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="py-1.5">{item.product.name}</td>
                <td className="py-1.5">{item.product.sku}</td>
                <td className="py-1.5">{item.size}</td>
                <td className="py-1.5 text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</p>
          <p className="mt-1 text-sm">{order.notes}</p>
        </div>
      )}

      <p className="mt-8 text-sm font-semibold">
        Total (Cash on Delivery): {formatCents(order.totalCents)}
      </p>
    </div>
  );
}
```

No dedicated test — same reasoning as Task 3's list page (a Server Component composing already-real Prisma types with JSX; the codebase doesn't unit-test pages).

- [ ] **Step 8: Verify it builds**

Run: `npm run build -w @zella/admin`
Expected: succeeds, no type errors. Confirm `/admin/orders/[id]/slip` appears in the route output.

- [ ] **Step 9: Commit**

```bash
git add apps/admin/src/app/admin/orders/[id]/page.tsx apps/admin/src/app/globals.css apps/admin/src/app/admin/orders/[id]/slip/
git commit -m "feat(admin): show size/SKU/product link per order line, add a packing slip view

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: `sendAdminOrderEmail` in `packages/core/src/email.ts`

**Files:**
- Modify: `apps/../packages/core/src/email.ts` (i.e. `packages/core/src/email.ts` — add to the existing file, don't replace `sendLoginPin`)
- Test: `packages/core/src/__tests__/email.test.ts`

**Interfaces:**
- Consumes: `formatPrice` from `./format` (already exists in this package).
- Produces: `sendAdminOrderEmail(kind: AdminOrderEmailKind, order: AdminOrderEmailOrder): Promise<void>` and the `AdminOrderEmailKind` (`"placed" | "cancelled_by_customer" | "cancelled_by_admin"`) and `AdminOrderEmailOrder` (`{ orderNumber: string; customerName: string; totalCents: number }`) types, exported from `packages/core/src/email.ts`. Tasks 7 (`../email` from `packages/core/src/actions/`), 8 (same), and 9 (`@zella/core/email` from the admin app) all import these exact names.

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/core/src/__tests__/email.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendAdminOrderEmail } from "../email";

const order = { orderNumber: "ZELLA-ABCDE", customerName: "Ava Lin", totalCents: 500000 };

beforeEach(() => {
  vi.stubEnv("ADMIN_NOTIFY_EMAIL", "");
  vi.stubEnv("RESEND_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendAdminOrderEmail", () => {
  it("resolves without throwing when ADMIN_NOTIFY_EMAIL is unset", async () => {
    await expect(sendAdminOrderEmail("placed", order)).resolves.toBeUndefined();
  });

  it("resolves without throwing when ADMIN_NOTIFY_EMAIL is set but RESEND_API_KEY is not", async () => {
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "admin@example.com");
    await expect(sendAdminOrderEmail("cancelled_by_admin", order)).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -w @zella/core -- email`
Expected: FAIL — `sendAdminOrderEmail` is not exported from `../email`.

- [ ] **Step 3: Add the implementation**

Append to the end of `packages/core/src/email.ts` (keep the existing `sendLoginPin` function unchanged above it; add the import at the top):

Add to the top imports:
```typescript
import { formatPrice } from "./format";
```

Append at the bottom of the file:
```typescript
export type AdminOrderEmailKind = "placed" | "cancelled_by_customer" | "cancelled_by_admin";

export interface AdminOrderEmailOrder {
  orderNumber: string;
  customerName: string;
  totalCents: number;
}

const ADMIN_EMAIL_LABEL: Record<AdminOrderEmailKind, string> = {
  placed: "New order",
  cancelled_by_customer: "Order cancelled by customer",
  cancelled_by_admin: "Order cancelled",
};

/** Notifies ADMIN_NOTIFY_EMAIL of an order event. Never throws — a
 *  notification failure (missing env vars, a Resend error) must never
 *  fail the checkout/cancel/status-update action that triggered it. */
export async function sendAdminOrderEmail(
  kind: AdminOrderEmailKind,
  order: AdminOrderEmailOrder,
): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    console.log(
      `[email] ADMIN_NOTIFY_EMAIL not set — skipping "${kind}" notification for ${order.orderNumber}`,
    );
    return;
  }

  const label = ADMIN_EMAIL_LABEL[kind];
  const subject = `${label}: ${order.orderNumber}`;
  const text = `${label}\n\nOrder: ${order.orderNumber}\nCustomer: ${order.customerName}\nTotal: ${formatPrice(order.totalCents)}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[dev] admin order email (${kind}) for ${order.orderNumber}: ${text}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Zella <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (e) {
    console.error(`[email] failed to send "${kind}" notification for ${order.orderNumber}`, e);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/core -- email`
Expected: PASS (2/2).

- [ ] **Step 5: Run the full core suite to confirm nothing else broke**

Run: `npm run test -w @zella/core`
Expected: all tests pass (75 pre-existing + 2 new = 77).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/email.ts packages/core/src/__tests__/email.test.ts
git commit -m "feat(core): add sendAdminOrderEmail — notifies ADMIN_NOTIFY_EMAIL on order events

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Wire the "placed" email into checkout

**Files:**
- Modify: `packages/core/src/actions/place-order.ts`
- Modify: `packages/core/src/actions/__tests__/place-order.test.ts` (add the required mock — see Global Constraints)

**Interfaces:**
- Consumes: `sendAdminOrderEmail` from `../email` (Task 6).

- [ ] **Step 1: Add the required mock to the existing test file FIRST**

This file currently has no mock of `../../email` at all — **without this step, every test in this file would attempt to send a real email once Step 3 wires the call into `placeOrder`.** Add at the very top of `packages/core/src/actions/__tests__/place-order.test.ts`, before the existing imports:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("../../email", () => ({ sendAdminOrderEmail: vi.fn() }));

import { prisma } from "@zella/db";
```

(Replace the file's current first two lines — `import { describe, it, expect } from "vitest";` then a blank line then `import { prisma } from "@zella/db";` — with the three lines above. Everything else in the file after that stays exactly as-is.)

- [ ] **Step 2: Run the existing tests to confirm they still pass with the mock in place but no wiring yet**

Run: `npm run test -w @zella/core -- place-order`
Expected: PASS (5/5) — the mock is now present but unused, since `placeOrder` doesn't call it yet.

- [ ] **Step 3: Wire the call into `placeOrder`**

Add to the top imports of `packages/core/src/actions/place-order.ts`:
```typescript
import { sendAdminOrderEmail } from "../email";
```

Find this block (inside the `for` retry loop, right after `await prisma.order.create({...});` and before `return { ok: true, orderNumber, totalCents, email: parsed.data.email };`):

```typescript
      await prisma.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          paymentMethod: "COD",
          totalCents,
          discountCents,
          customerName: parsed.data.fullName,
          customerPhone: parsed.data.phone,
          customerWhatsapp: parsed.data.whatsapp || null,
          customerEmail: parsed.data.email,
          notes: parsed.data.notes || null,
          address: { create: address },
          items: { create: resolvedItems },
        },
      });

      return {
        ok: true,
        orderNumber,
        totalCents,
        email: parsed.data.email,
      };
```

Replace with:

```typescript
      await prisma.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          paymentMethod: "COD",
          totalCents,
          discountCents,
          customerName: parsed.data.fullName,
          customerPhone: parsed.data.phone,
          customerWhatsapp: parsed.data.whatsapp || null,
          customerEmail: parsed.data.email,
          notes: parsed.data.notes || null,
          address: { create: address },
          items: { create: resolvedItems },
        },
      });

      try {
        await sendAdminOrderEmail("placed", {
          orderNumber,
          customerName: parsed.data.fullName,
          totalCents,
        });
      } catch (e) {
        console.error(`[email] failed to send "placed" notification for ${orderNumber}`, e);
      }

      return {
        ok: true,
        orderNumber,
        totalCents,
        email: parsed.data.email,
      };
```

- [ ] **Step 4: Run to verify all tests still pass**

Run: `npm run test -w @zella/core -- place-order`
Expected: PASS (5/5).

- [ ] **Step 5: Add one test asserting the notification fires on a successful order**

Add inside `describe("placeOrder", ...)`, after the existing "places an order with no verified session..." test:

```typescript
  it("notifies admin when an order is placed", async () => {
    const email = uniqueEmail("notify-placed");
    const res = await placeOrder(
      undefined,
      form({ ...fields(email), items: JSON.stringify([cartLine()]) }),
    );
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;

    const { sendAdminOrderEmail } = await import("../../email");
    expect(sendAdminOrderEmail).toHaveBeenCalledWith(
      "placed",
      expect.objectContaining({ orderNumber: res.orderNumber }),
    );
  });
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm run test -w @zella/core -- place-order`
Expected: PASS (6/6).

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/actions/place-order.ts packages/core/src/actions/__tests__/place-order.test.ts
git commit -m "feat(core): notify admin by email when a customer places an order

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Wire the "cancelled by customer" email into `cancelOrder`

**Files:**
- Modify: `packages/core/src/actions/account.ts`
- Modify: `packages/core/src/actions/__tests__/account.test.ts`

**Interfaces:**
- Consumes: `sendAdminOrderEmail` from `../email` (Task 6).

- [ ] **Step 1: Update the existing mock in the test file**

`packages/core/src/actions/__tests__/account.test.ts` line 4 currently reads:
```typescript
vi.mock("../../email", () => ({ sendLoginPin: vi.fn() }));
```
Replace with:
```typescript
vi.mock("../../email", () => ({ sendLoginPin: vi.fn(), sendAdminOrderEmail: vi.fn() }));
```

Update the import on line 10 from:
```typescript
import { sendLoginPin } from "../../email";
```
to:
```typescript
import { sendLoginPin, sendAdminOrderEmail } from "../../email";
```

Update the `beforeEach` block (currently just `__resetCookieJar(); vi.mocked(sendLoginPin).mockClear();`) to also clear the new mock:
```typescript
beforeEach(() => {
  __resetCookieJar();
  vi.mocked(sendLoginPin).mockClear();
  vi.mocked(sendAdminOrderEmail).mockClear();
});
```

- [ ] **Step 2: Run to confirm the existing tests still pass with the updated mock**

Run: `npm run test -w @zella/core -- account`
Expected: PASS (4/4) — mock updated, but `cancelOrder` doesn't call `sendAdminOrderEmail` yet.

- [ ] **Step 3: Wire the call into `cancelOrder`**

Add to the top imports of `packages/core/src/actions/account.ts`:
```typescript
import { sendAdminOrderEmail } from "../email";
```

Replace the current `cancelOrder` function body:
```typescript
export async function cancelOrder(orderId: string) {
  const customer = await getSessionCustomer();
  if (!customer) return;

  await prisma.order.updateMany({
    where: { id: orderId, customerId: customer.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/account");
}
```
with:
```typescript
export async function cancelOrder(orderId: string) {
  const customer = await getSessionCustomer();
  if (!customer) return;

  const result = await prisma.order.updateMany({
    where: { id: orderId, customerId: customer.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  if (result.count > 0) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      try {
        await sendAdminOrderEmail("cancelled_by_customer", {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalCents: order.totalCents,
        });
      } catch (e) {
        console.error(
          `[email] failed to send "cancelled_by_customer" notification for ${order.orderNumber}`,
          e,
        );
      }
    }
  }

  revalidatePath("/account");
}
```

(The security-critical `where: { id: orderId, customerId: customer.id, status: "PENDING" }` ownership + race check inside `updateMany` is unchanged — only the follow-up read-for-the-email and the email call are new.)

- [ ] **Step 4: Run to verify all tests still pass**

Run: `npm run test -w @zella/core -- account`
Expected: PASS (4/4).

- [ ] **Step 5: Add two tests — notifies on success, doesn't notify on a no-op**

Add inside `describe("cancelOrder", ...)`, after the existing "cancels the signed-in customer's own pending order" test:

```typescript
  it("notifies admin when cancellation succeeds", async () => {
    const email = uniqueEmail("notify-cancel");
    await signInAs(email);
    const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
    const order = await makeOrder(customer.id, email);

    await cancelOrder(order.id);

    expect(sendAdminOrderEmail).toHaveBeenCalledWith(
      "cancelled_by_customer",
      expect.objectContaining({ orderNumber: order.orderNumber }),
    );
  });

  it("does not notify admin when cancellation is a no-op", async () => {
    const email = uniqueEmail("no-notify-cancel");
    await signInAs(email);
    const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
    const order = await makeOrder(customer.id, email, "CANCELLED");

    await cancelOrder(order.id);

    expect(sendAdminOrderEmail).not.toHaveBeenCalled();
  });
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm run test -w @zella/core -- account`
Expected: PASS (6/6).

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/actions/account.ts packages/core/src/actions/__tests__/account.test.ts
git commit -m "feat(core): notify admin by email when a customer cancels their order

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Wire the "cancelled by admin" email into `updateOrderStatus`

**Files:**
- Modify: `apps/admin/src/app/admin/orders/actions.ts`
- Test: `apps/admin/src/app/admin/orders/__tests__/actions.test.ts` (new — this is the first test file for any admin Server Action)

**Interfaces:**
- Consumes: `sendAdminOrderEmail` from `@zella/core/email` (Task 6, cross-package import — admin already depends on `@zella/core`).

- [ ] **Step 1: Write the failing tests**

```typescript
// apps/admin/src/app/admin/orders/__tests__/actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ id: "test-admin" }) }));
vi.mock("@zella/core/email", () => ({ sendAdminOrderEmail: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@zella/db";
import { updateOrderStatus } from "../actions";
import { sendAdminOrderEmail } from "@zella/core/email";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function makeOrder(status: "PENDING" | "CANCELLED" = "PENDING") {
  return prisma.order.create({
    data: {
      orderNumber: `TST${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status,
      totalCents: 5000,
      customerName: "Test Customer",
      customerPhone: "+1 555 0100",
      address: {
        create: {
          fullName: "Test Customer",
          phone: "+1 555 0100",
          line1: "1 Test Street",
          city: "Testville",
          country: "Pakistan",
        },
      },
    },
  });
}

beforeEach(() => {
  vi.mocked(sendAdminOrderEmail).mockClear();
});

describe("updateOrderStatus", () => {
  it("updates the order's status", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CONFIRMED" }));
    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("CONFIRMED");
  });

  it("ignores an invalid status value", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "NOT_A_STATUS" }));
    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });

  it("notifies admin when transitioning into CANCELLED", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CANCELLED" }));
    expect(sendAdminOrderEmail).toHaveBeenCalledWith(
      "cancelled_by_admin",
      expect.objectContaining({ orderNumber: order.orderNumber }),
    );
  });

  it("does not re-notify when the order is already CANCELLED", async () => {
    const order = await makeOrder("CANCELLED");
    await updateOrderStatus(order.id, form({ status: "CANCELLED" }));
    expect(sendAdminOrderEmail).not.toHaveBeenCalled();
  });

  it("does not notify for a non-cancellation status change", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CONFIRMED" }));
    expect(sendAdminOrderEmail).not.toHaveBeenCalled();
  });

  it("rejects when the caller is not an authenticated admin", async () => {
    const { requireAdmin } = await import("@/lib/auth");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Unauthorized"));

    const order = await makeOrder();
    await expect(updateOrderStatus(order.id, form({ status: "CONFIRMED" }))).rejects.toThrow(
      "Unauthorized",
    );

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test -w @zella/admin -- actions`
Expected: FAIL — the "notifies admin" tests fail because `updateOrderStatus` doesn't call `sendAdminOrderEmail` yet (the other tests, including the `requireAdmin` gate test, may already pass against the current implementation since that check already exists).

- [ ] **Step 3: Wire the call into `updateOrderStatus`**

Add to the top imports of `apps/admin/src/app/admin/orders/actions.ts`:
```typescript
import { sendAdminOrderEmail } from "@zella/core/email";
```

Replace the current function body:
```typescript
export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as OrderStatus)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
```
with:
```typescript
export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as OrderStatus)) return;

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  if (status === "CANCELLED" && existing.status !== "CANCELLED") {
    try {
      await sendAdminOrderEmail("cancelled_by_admin", {
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        totalCents: updated.totalCents,
      });
    } catch (e) {
      console.error(
        `[email] failed to send "cancelled_by_admin" notification for ${updated.orderNumber}`,
        e,
      );
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test -w @zella/admin -- actions`
Expected: PASS (6/6).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/orders/actions.ts apps/admin/src/app/admin/orders/__tests__/actions.test.ts
git commit -m "feat(admin): notify admin by email when an order is cancelled from admin

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Full verification

**Files:** none.

**Interfaces:**
- Consumes: all prior tasks' commits.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test -w @zella/core -w @zella/admin -w @zella/storefront-1 -w @zella/storefront-2`
Expected: all pass — `@zella/core` 83 (75 pre-existing + 2 email + 1 place-order + 2 account additions), `@zella/admin` 19 (8 where + 5 csv + 6 actions), storefront-1/2 unaffected.

- [ ] **Step 2: Run both builds**

Run: `npm run build -w @zella/admin` and `npm run build -w @zella/core` (core has no build script — skip if absent; confirm via `cat packages/core/package.json`).
Expected: admin build succeeds, no type errors; confirm `/admin/orders/export` and `/admin/orders/[id]/slip` both appear in the route output.

- [ ] **Step 3: Manual post-deploy checklist (for the user, after this plan's branch is merged and deployed — not something to automate here)**

- Filter the orders list by status, by a date range, and by a search term; confirm results match and "Clear" resets it.
- Open an order's detail page; confirm each line shows size, SKU, and a working link to that product's edit page.
- Open a packing slip; confirm it renders cleanly and the browser print dialog produces a clean printout with no admin nav.
- Export CSV with and without filters applied; confirm the two match what's on screen.
- Place one real test order (or cancel one) and confirm an email actually arrives at `jedi.raza007@gmail.com` — this is the one thing no automated test in this plan covers, since it requires a live send.

No commit — verification only.
