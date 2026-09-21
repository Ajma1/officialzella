import type { MetadataRoute } from "next";
import { getAllProducts } from "@zella/core/catalog";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officialzella.com";

const STATIC_ROUTES = [
  "",
  "/shirts",
  "/trousers",
  "/pair",
  "/our-story",
  "/lookbook",
  "/size-guide",
  "/feedback",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
  }));

  return [...staticEntries, ...productEntries];
}
