import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [productCount, pendingOrders, totalOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
  ]);

  const cards = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Pending orders", value: pendingOrders, href: "/admin/orders" },
    { label: "Total orders", value: totalOrders, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
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
    </div>
  );
}
