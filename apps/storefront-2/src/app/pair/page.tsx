import type { Metadata } from "next";
import { getProductsByCategory } from "@zella/core/catalog";
import PairBuilder from "@/components/PairBuilder";

export const metadata: Metadata = { title: "Make a pair — Zella" };

export default async function PairPage() {
  const [shirts, trousers] = await Promise.all([
    getProductsByCategory("SHIRT"),
    getProductsByCategory("TROUSER"),
  ]);
  const shirtsWithPhotos = shirts.filter((p) => p.images.length > 0);
  const trousersWithPhotos = trousers.filter((p) => p.images.length > 0);

  return (
    <section className="container" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">The pair</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.04, margin: "0 0 14px" }}>Two pieces, one price.</h1>
      <p style={{ maxWidth: "44ch", margin: "0 0 42px", fontSize: 16, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 80%, transparent)" }}>
        Choose a shirt. Choose a trouser.
      </p>
      <PairBuilder shirts={shirtsWithPhotos} trousers={trousersWithPhotos} />
    </section>
  );
}
