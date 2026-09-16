"use server";

import type { CartItem } from "@/lib/cart/store";
import { getProductBySlug } from "@/lib/catalog";
import { variantStock } from "@/lib/catalog.helpers";

export interface RevalidatedLine {
  productId: string;
  size: string;
  ok: boolean;
  priceChanged?: { from: number; to: number };
  unavailable?: boolean;
}

export interface RevalidateResult {
  lines: RevalidatedLine[];
  subtotalCents: number;
  hasCorrections: boolean;
}

/**
 * Re-checks each cart line's price + availability against source of truth.
 * `subtotalCents` is recomputed from **source** prices for available lines.
 */
export async function revalidateCart(
  items: CartItem[],
): Promise<RevalidateResult> {
  const lines: RevalidatedLine[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const product = await getProductBySlug(item.slug);
    if (!product || variantStock(product, item.size) < item.qty) {
      lines.push({
        productId: item.productId,
        size: item.size,
        ok: false,
        unavailable: true,
      });
      continue;
    }

    const priceChanged =
      product.priceCents !== item.priceCents
        ? { from: item.priceCents, to: product.priceCents }
        : undefined;

    lines.push({
      productId: item.productId,
      size: item.size,
      ok: true,
      priceChanged,
    });
    subtotalCents += product.priceCents * item.qty;
  }

  return {
    lines,
    subtotalCents,
    hasCorrections: lines.some((l) => l.unavailable || l.priceChanged),
  };
}
