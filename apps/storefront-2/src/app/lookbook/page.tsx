import type { Metadata } from "next";
import { getAllProducts } from "@zella/core/catalog";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "Lookbook — Zella" };

export default async function LookbookPage() {
  const products = (await getAllProducts()).filter((p) => p.images.length > 0);

  return (
    <section className="container" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">The edit</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", margin: "0 0 34px" }}>Lookbook</h1>
      <div className="grid-products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
