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
