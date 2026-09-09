import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { updateOrderStatus } from "../actions";
import { OrderStatus } from "@/generated/prisma";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default async function OrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  const boundUpdate = updateOrderStatus.bind(null, order.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Placed {order.createdAt.toLocaleString()}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Customer</h2>
          <p className="mt-2 text-sm">{order.customerName}</p>
          <p className="text-sm text-neutral-600">{order.customerPhone}</p>
          {order.customerEmail && (
            <p className="text-sm text-neutral-600">{order.customerEmail}</p>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">
            Delivery address
          </h2>
          <p className="mt-2 text-sm">{order.address.fullName}</p>
          <p className="text-sm text-neutral-600">{order.address.phone}</p>
          <p className="text-sm text-neutral-600">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}
          </p>
          <p className="text-sm text-neutral-600">
            {order.address.city}
            {order.address.state ? `, ${order.address.state}` : ""}{" "}
            {order.address.postalCode ?? ""}
          </p>
          <p className="text-sm text-neutral-600">{order.address.country}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Items</h2>
        <div className="mt-3 divide-y divide-neutral-100">
          {order.items.map((item) => (
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
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-semibold">
          <span>Total (Cash on Delivery)</span>
          <span className="tabular-nums">{formatCents(order.totalCents)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-neutral-500">Notes</h2>
          <p className="mt-2 text-sm">{order.notes}</p>
        </div>
      )}

      <form action={boundUpdate} className="mt-6 flex items-center gap-3">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={order.status}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ").toLowerCase()}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-cherry px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Update
        </button>
      </form>
    </div>
  );
}
