import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";
import { categoryMeta } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Bundles — Zella",
  description: categoryMeta("BUNDLE").blurb,
};

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  return <CategoryListing category="BUNDLE" sort={sort} />;
}
