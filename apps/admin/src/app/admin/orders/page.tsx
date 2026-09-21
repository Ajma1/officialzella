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
            : "No orders yet — they'll show up here once checkout is live."}
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
