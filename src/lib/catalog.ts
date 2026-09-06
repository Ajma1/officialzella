/**
 * Catalog data access — the swap seam.
 *
 * Today every function reads the in-repo seed array. When Supabase / Postgres
 * access lands, only these bodies change to Prisma queries; the async
 * signatures and every call site stay exactly as they are.
 */
import { SEED_PRODUCTS, type Category, type Product } from "@/data/catalog.seed";

// TODO(db): every query below gains `WHERE active = true` once the column exists.
function activeProducts(): Product[] {
  return SEED_PRODUCTS;
}

export async function getAllProducts(): Promise<Product[]> {
  return activeProducts();
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  return activeProducts().filter((p) => p.category === category);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return activeProducts().find((p) => p.slug === slug) ?? null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return activeProducts().filter((p) => {
    const haystack = [p.name, p.colorway ?? "", p.category, p.description]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  return activeProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
}
