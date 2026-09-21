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
