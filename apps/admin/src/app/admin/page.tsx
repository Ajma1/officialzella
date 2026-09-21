import Link from "next/link";
import { prisma, OrderStatus } from "@zella/db";
import { formatPrice } from "@zella/core/format";
import { rangeToDates, type DashboardRange } from "./dashboard-range";
import { shopDateKey } from "@/lib/shop-timezone";
import { sumRevenue, averageOrderValue, rankSellers } from "./dashboard-metrics";

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
  const now = new Date();

  const [activeProductCount, pendingOrders, totalOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
  ]);

  const cards = [
    { label: "Products", value: activeProductCount, href: "/admin/products" },
    { label: "Pending orders (all time)", value: pendingOrders, href: "/admin/orders?status=PENDING" },
    { label: "Total orders (all time)", value: totalOrders, href: "/admin/orders" },
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

  const revenueCents = sumRevenue(rangeOrders);
  const orderCount = rangeOrders.length;
  const aovCents = averageOrderValue(revenueCents, orderCount);

  // Daily trend only makes sense for bounded ranges — an "all time" list of
  // daily bars could span years and isn't a meaningful visualization.
  const dailyTrend =
    range === "all"
      ? []
      : (() => {
          const buckets = new Map<string, number>();
          // Seed every day in the range at 0 first, so a day with no sales
          // still gets a bar (at 0) instead of silently vanishing — without
          // this, three sale-days out of seven render as three adjacent
          // bars, which reads as three consecutive days.
          if (start) {
            for (
              let d = new Date(start);
              d <= now;
              d.setUTCDate(d.getUTCDate() + 1)
            ) {
              buckets.set(shopDateKey(d), 0);
            }
          }
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

  const rankedSellers = rankSellers(
    rangeItems.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
  );
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
  const lowStockList = [...lowStockByProduct.entries()];

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
          <p className="text-sm text-neutral-500">Revenue (incl. delivery)</p>
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

      {range !== "all" && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Daily revenue</h2>
          {dailyTrend.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No sales in this range.</p>
          ) : (
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
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">
            Best sellers <span className="font-normal">(product revenue)</span>
          </h2>
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
          <h2 className="text-sm font-semibold text-neutral-500">
            Worst sellers <span className="font-normal">(product revenue)</span>
          </h2>
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
            {lowStockList.map(([productId, p]) => (
              <div key={productId}>
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

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Order status</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_ORDER.map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}${start ? `&from=${shopDateKey(start)}` : ""}`}
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
    </div>
  );
}
