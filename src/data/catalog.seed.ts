/**
 * In-repo seed catalog — the single source of truth until Supabase / Postgres
 * access lands (see docs/superpowers/specs/2026-09-07-storefront-frontend-design.md).
 *
 * `src/lib/catalog.ts` is the async data-access seam over this data; when the DB
 * arrives, only those function bodies change, not this shape.
 *
 * Product truth (PRODUCT.md): only the 6 shirt photos in /public are real.
 * Trousers and Bundles carry `images: []` and render the "photo coming soon"
 * Polaroid treatment. Every price is a PLACEHOLDER — see PLACEHOLDER_DATA.md.
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
  /** PLACEHOLDER price in minor units (PKR paisa — Rs × 100). See PLACEHOLDER_DATA.md. */
  priceCents: number;
  /** Optional "was" / compare-at price in the same units; must be > priceCents.
   *  Rendered struck-through next to the current price.
   *  TODO(admin): add a "Compare-at price (was)" field to the admin product form. */
  compareAtCents?: number;
  images: ProductImage[];
  variants: Variant[];
  isNew?: boolean;
}

const fullRun = (stock: Record<Size, number>): Variant[] =>
  (["XS", "S", "M", "L", "XL"] as Size[]).map((size) => ({ size, stock: stock[size] }));

export const SEED_PRODUCTS: Product[] = [
  {
    id: "shirt-sky-stripe",
    slug: "sky-stripe-shirt",
    name: "Sky Stripe Shirt",
    description:
      "A relaxed shirt in breathable cotton with a soft sky-blue stripe. Cut roomy through the body and shoulder so it moves with you and layers easily.",
    category: "SHIRT",
    colorway: "Sky stripe",
    colorwaySwatch: "#9cc6e8",
    priceCents: 299000,
    compareAtCents: 399000,
    images: [
      { url: "/shirt-sky-stripe.jpg", alt: "Zella sky-stripe relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 6, S: 9, M: 12, L: 8, XL: 4 }),
    isNew: true,
  },
  {
    id: "shirt-burgundy",
    slug: "burgundy-shirt",
    name: "Burgundy Shirt",
    description:
      "The everyday cotton shirt in a deep burgundy. Relaxed fit, dropped shoulder, and a fabric that softens the more you wear it.",
    category: "SHIRT",
    colorway: "Burgundy",
    colorwaySwatch: "#6d2733",
    priceCents: 249000,
    images: [
      { url: "/shirt-burgundy.jpg", alt: "Zella burgundy relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 3, S: 7, M: 10, L: 6, XL: 2 }),
  },
  {
    id: "shirt-lilac",
    slug: "lilac-shirt",
    name: "Lilac Shirt",
    description:
      "A soft lilac cotton shirt with room to move. Light enough for warm days, roomy enough to knot at the waist or wear open over a tee.",
    category: "SHIRT",
    colorway: "Lilac",
    colorwaySwatch: "#c6b3da",
    priceCents: 289000,
    compareAtCents: 349000,
    images: [
      { url: "/shirt-lilac.jpg", alt: "Zella lilac relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 5, S: 8, M: 9, L: 7, XL: 5 }),
    isNew: true,
  },
  {
    id: "shirt-mocha-stripe",
    slug: "mocha-stripe-shirt",
    name: "Mocha Stripe Shirt",
    description:
      "Warm mocha stripe on breathable cotton. Relaxed through the body with a longer back hem for easy coverage over trousers.",
    category: "SHIRT",
    colorway: "Mocha stripe",
    colorwaySwatch: "#a9926f",
    priceCents: 279000,
    images: [
      { url: "/shirt-mocha-stripe.jpg", alt: "Zella mocha-stripe relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 0, S: 4, M: 6, L: 5, XL: 3 }),
  },
  {
    id: "shirt-butter-stripe",
    slug: "butter-stripe-shirt",
    name: "Butter Stripe Shirt",
    description:
      "A sunny butter-yellow stripe on soft cotton. The relaxed cut everyone reaches for first — currently sold out while we restock.",
    category: "SHIRT",
    colorway: "Butter stripe",
    colorwaySwatch: "#f2d879",
    priceCents: 299000,
    images: [
      { url: "/shirt-yellow-stripe.jpg", alt: "Zella butter-stripe relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 0, S: 0, M: 0, L: 0, XL: 0 }),
  },
  {
    id: "shirt-denim-stripe",
    slug: "denim-stripe-shirt",
    name: "Denim Stripe Shirt",
    description:
      "A cotton shirt in a washed denim-blue stripe. Relaxed fit, mother-of-pearl buttons, and a collar that sits soft and open.",
    category: "SHIRT",
    colorway: "Denim stripe",
    colorwaySwatch: "#5b7bab",
    priceCents: 329000,
    compareAtCents: 399000,
    images: [
      { url: "/shirt-blue-stripe.jpg", alt: "Zella denim-stripe relaxed-fit cotton shirt, flat lay" },
    ],
    variants: fullRun({ XS: 0, S: 5, M: 7, L: 4, XL: 6 }),
  },
  {
    id: "trouser-mocha",
    slug: "mocha-everyday-trouser",
    name: "Mocha Everyday Trouser",
    description:
      "An easy wide-leg cotton trouser in warm mocha. Elastic back waist, deep pockets, and a leg that moves all day. Photography coming soon.",
    category: "TROUSER",
    colorway: "Mocha",
    colorwaySwatch: "#a9926f",
    priceCents: 399000,
    images: [],
    variants: fullRun({ XS: 4, S: 6, M: 8, L: 6, XL: 3 }),
  },
  {
    id: "trouser-denim",
    slug: "denim-everyday-trouser",
    name: "Denim Everyday Trouser",
    description:
      "The everyday cotton trouser in washed denim-blue. Relaxed straight leg, sits at the waist, made to be lived in. Photography coming soon.",
    category: "TROUSER",
    colorway: "Denim",
    colorwaySwatch: "#5b7bab",
    priceCents: 399000,
    compareAtCents: 499000,
    images: [],
    variants: fullRun({ XS: 5, S: 7, M: 9, L: 5, XL: 4 }),
    isNew: true,
  },
  {
    id: "bundle-sky-mocha",
    slug: "sky-shirt-mocha-trouser-bundle",
    name: "Sky Shirt + Mocha Trouser Bundle",
    description:
      "The whole fit in one go — the Sky Stripe Shirt with the Mocha Everyday Trouser, bundled at a better price. Photography coming soon.",
    category: "BUNDLE",
    colorway: "Sky / Mocha",
    colorwaySwatch: "#9cc6e8",
    priceCents: 649000,
    compareAtCents: 798000,
    images: [],
    variants: fullRun({ XS: 3, S: 5, M: 6, L: 4, XL: 2 }),
  },
];
