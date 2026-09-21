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
