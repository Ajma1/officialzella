import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";

export const metadata: Metadata = { title: "Shirts — Zella" };

export default function ShirtsPage() {
  return (
    <CategoryListing
      category="SHIRT"
      kicker="Button-down"
      title="The shirts"
      blurb="Relaxed through the shoulder, cut roomy through the body — breathable cotton, colour by colour."
    />
  );
}
