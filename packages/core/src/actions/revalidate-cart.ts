"use server";

import type { CartItem } from "../cart/store";
import { getProductBySlug } from "../catalog";
import { variantStock } from "../catalog-helpers";
import { PAIR_PRICE_CENTS } from "../checkout/pairing";

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
    const pairProduct = item.pair ? await getProductBySlug(item.pair.slug) : null;
    const unavailable =
      !product ||
      variantStock(product, item.size) < item.qty ||
      (item.pair && (!pairProduct || variantStock(pairProduct, item.size) < item.qty));

    if (unavailable) {
      lines.push({
        productId: item.productId,
        size: item.size,
        ok: false,
        unavailable: true,
      });
      continue;
    }

    // A pair line's source price is the flat bundle price, not either
    // product's own priceCents.
    const sourcePriceCents = item.pair ? PAIR_PRICE_CENTS : product.priceCents;
    const priceChanged =
      sourcePriceCents !== item.priceCents
        ? { from: item.priceCents, to: sourcePriceCents }
        : undefined;

    lines.push({
      productId: item.productId,
      size: item.size,
      ok: true,
      priceChanged,
    });
    subtotalCents += sourcePriceCents * item.qty;
  }

  return {
    lines,
    subtotalCents,
    hasCorrections: lines.some((l) => l.unavailable || l.priceChanged),
  };
}
