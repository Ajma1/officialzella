import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";
import { categoryMeta } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Shirts — Zella",
  description: categoryMeta("SHIRT").blurb,
};

export default async function ShirtsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  return <CategoryListing category="SHIRT" sort={sort} />;
}
