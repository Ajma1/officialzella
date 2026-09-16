/**
 * Shared catalog types. `src/catalog.ts` is the async data-access layer
 * over the real Product/ProductVariant/ProductImage tables (see
 * packages/db) — this file only carries the shapes both storefronts and
 * `catalog-helpers.ts` build against.
 */

export type Size = "XS" | "S" | "M" | "L" | "XL";
export type Category = "SHIRT" | "TROUSER" | "BUNDLE";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Variant {
  size: Size;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  colorway: string | null;
  /** Hex sampling the real photo colour (Colorway-Swatch Rule); also the
   *  fill for the placeholder Polaroid when `images` is empty. */
  colorwaySwatch: string;
  /** Price in minor units (PKR paisa — Rs × 100). */
  priceCents: number;
  /** Optional "was" / compare-at price in the same units; must be > priceCents.
   *  Rendered struck-through next to the current price. */
  compareAtCents?: number;
  images: ProductImage[];
  variants: Variant[];
  isNew?: boolean;
}
