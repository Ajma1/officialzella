import CategoryRows from "@/components/CategoryRows";
import Hero from "@/components/Hero";
import { getProductsByCategory } from "@zella/core/catalog";
import type { Product } from "@zella/core/catalog-types";

const withPhotos = (products: Product[]) => products.filter((p) => p.images.length > 0);

export default async function Home() {
  const [shirts, trousers] = await Promise.all([
    getProductsByCategory("SHIRT"),
    getProductsByCategory("TROUSER"),
  ]);
  const shotShirts = withPhotos(shirts);
  const shotTrousers = withPhotos(trousers);

  const heroPolaroids = [
    shotShirts[0] && { product: shotShirts[0], label: "Shirts" },
    shotShirts[1] && { product: shotShirts[1], label: "Shirts" },
    shotTrousers[0] && { product: shotTrousers[0], label: "Trousers" },
  ].filter((p): p is { product: Product; label: string } => Boolean(p));

  const colorways = shotShirts.map((p) => ({
    name: p.colorway ?? p.name,
    swatch: p.colorwaySwatch,
  }));

  // Burgundy Button-Down + Black Wide-Leg are the seed catalog's own
  // stated "natural partner" pairing — the realest bundle preview on hand.
  const shirtThumb = shotShirts.find((p) => p.slug === "burgundy-button-down-shirt") ?? shotShirts[0];
  const trouserThumb = shotTrousers.find((p) => p.slug === "black-wide-leg-trouser") ?? shotTrousers[0];

  return (
    <main className="flex flex-1 flex-col">
      <Hero polaroids={heroPolaroids} colorways={colorways} />
      <CategoryRows shirtThumb={shirtThumb} trouserThumb={trouserThumb} />
    </main>
  );
}
