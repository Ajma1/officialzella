/** Pure catalog helpers — no I/O, safe to run anywhere. */
import type { Product, Size } from "@/data/catalog.seed";

export type SortKey = "new" | "price-asc" | "price-desc";

export function isSoldOut(product: Product): boolean {
  return product.variants.every((v) => v.stock === 0);
}

export function variantStock(product: Product, size: Size): number {
  return product.variants.find((v) => v.size === size)?.stock ?? 0;
}

export type AddCheck = { ok: true } | { ok: false; error: string };

export function canAddToCart(
  product: Product,
  size: Size | null,
  qty: number,
): AddCheck {
  if (!size) return { ok: false, error: "Pick a size first" };
  if (qty < 1) return { ok: false, error: "Quantity must be at least 1" };
  const stock = variantStock(product, size);
  if (stock === 0) return { ok: false, error: "That size is sold out" };
  if (qty > stock) return { ok: false, error: `Only ${stock} left in that size` };
  return { ok: true };
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "new":
      return copy.sort(
        (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)),
      );
  }
}
