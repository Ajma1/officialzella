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
    </div>
  );
}
