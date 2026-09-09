import type { Category } from "@/data/catalog.seed";

/** Display metadata for the three shop categories — shared by the listing
 *  pages, the footer, CategoryRows, and empty states. Blurbs are the confirmed
 *  copy from the original CategoryRows component. */
export interface CategoryMeta {
  category: Category;
  name: string;
  href: string;
  blurb: string;
  swatch: string;
  sampleImage: string | null;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    category: "SHIRT",
    name: "Shirts",
    href: "/shirts",
    blurb:
      "Relaxed shirts, cut from breathable cotton — soft against the skin, roomy where it counts.",
    swatch: "#9cc6e8",
    sampleImage: "/shirt-sky-stripe.jpg",
  },
  {
    category: "TROUSER",
    name: "Trousers",
    href: "/trousers",
    blurb: "Easy trousers built to move with you, all day long.",
    swatch: "#a9926f",
    sampleImage: null,
  },
  {
    category: "BUNDLE",
    name: "Bundles",
    href: "/bundles",
    blurb:
      "Shirt + trousers, bundled together — the whole fit, sorted in one go.",
    swatch: "#c6b3da",
    sampleImage: null,
  },
];

export function categoryMeta(category: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.category === category)!;
}
