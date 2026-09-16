import type { Metadata } from "next";
import CategoryListing from "@/components/CategoryListing";

export const metadata: Metadata = { title: "Trousers — Zella" };

export default function TrousersPage() {
  return (
    <CategoryListing
      category="TROUSER"
      kicker="Wide-leg"
      title="The trousers"
      blurb="High-waisted, wide through the leg, pressed to a clean centre crease — the natural partner to every shirt in the edit."
    />
  );
}
