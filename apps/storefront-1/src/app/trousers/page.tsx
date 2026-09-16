import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";
import { categoryMeta } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Trousers — Zella",
  description: categoryMeta("TROUSER").blurb,
};

export default async function TrousersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  return <CategoryListing category="TROUSER" sort={sort} />;
}
