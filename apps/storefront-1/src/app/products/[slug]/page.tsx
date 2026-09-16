import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog";
import ProductDetail from "@/components/ProductDetail";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found — Zella" };
  return {
    title: `${product.name} — Zella`,
    description: product.description,
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0].url }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  return <ProductDetail product={product} related={related} />;
}
