export interface OrderForMetrics {
  totalCents: number;
}

export function sumRevenue(orders: OrderForMetrics[]): number {
  return orders.reduce((sum, o) => sum + o.totalCents, 0);
}

export function averageOrderValue(revenueCents: number, orderCount: number): number {
  return orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;
}

export interface OrderItemForMetrics {
  productId: string;
  productName: string;
  quantity: number;
  priceCents: number;
}

export interface SellerTotal {
  productId: string;
  name: string;
  units: number;
  revenueCents: number;
}

/** Ranks products by units sold, descending. Revenue is priceCents *
 *  quantity per row (priceCents is a PER-UNIT price on OrderItem) — summing
 *  priceCents alone, as the spec's own suggested query did, undercounts any
 *  line with quantity > 1. */
export function rankSellers(items: OrderItemForMetrics[]): SellerTotal[] {
  const totals = new Map<string, SellerTotal>();
  for (const item of items) {
    const entry = totals.get(item.productId) ?? {
      productId: item.productId,
      name: item.productName,
      units: 0,
      revenueCents: 0,
    };
    entry.units += item.quantity;
    entry.revenueCents += item.priceCents * item.quantity;
    totals.set(item.productId, entry);
  }
  return [...totals.values()].sort((a, b) => b.units - a.units);
}
