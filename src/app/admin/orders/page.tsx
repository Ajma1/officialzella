import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { address: true, items: true },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          No orders yet — they&rsquo;ll show up here once checkout is live.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {order.customerName}
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
