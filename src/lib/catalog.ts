/**
 * Catalog data access — the swap seam.
 *
 * Reads the real Product/ProductVariant/ProductImage tables through Prisma.
 * The async signatures and every call site stay exactly as before the swap.
 */
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type { Category, Product } from "@/data/catalog.seed";

const include = {
  images: { orderBy: { position: "asc" as const } },
  variants: true,
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category as Category,
    colorway: row.colorway,
    colorwaySwatch: row.colorwaySwatch,
    priceCents: row.priceCents,
    compareAtCents: row.compareAtCents ?? undefined,
    images: row.images.map((img) => ({ url: img.url, alt: img.alt ?? row.name })),
    variants: row.variants.map((v) => ({ size: v.size, stock: v.stock })),
    isNew: Date.now() - row.createdAt.getTime() < NEW_WINDOW_MS,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category },
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { active: true, slug },
    include,
  });
  return row ? toProduct(row) : null;
}

const CATEGORIES: Category[] = ["SHIRT", "TROUSER", "BUNDLE"];

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const matchingCategories = CATEGORIES.filter((c) => c.includes(q.toUpperCase()));
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { colorway: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        ...(matchingCategories.length > 0 ? [{ category: { in: matchingCategories } }] : []),
      ],
    },
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProduct);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category: product.category, id: { not: product.id } },
    include,
    orderBy: { createdAt: "asc" },
    take: 3,
  });
  return rows.map(toProduct);
}
