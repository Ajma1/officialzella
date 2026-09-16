import type { Metadata } from "next";
import { getProductsByCategory } from "@zella/core/catalog";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import { formatPrice } from "@zella/core/format";
import PairBuilder from "@/components/PairBuilder";

export const metadata: Metadata = {
  title: "Bundles — Zella",
  description: "Shirt + trousers, bundled together — the whole fit, sorted in one go.",
};

export default async function BundlesPage() {
  const [shirts, trousers] = await Promise.all([
    getProductsByCategory("SHIRT"),
    getProductsByCategory("TROUSER"),
  ]);
  const shirtsWithPhotos = shirts.filter((p) => p.images.length > 0);
  const trousersWithPhotos = trousers.filter((p) => p.images.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-10 lg:px-16">
      <h1 className="font-display leading-[0.95] tracking-tight text-foreground text-[clamp(2rem,6vw,3.25rem)]">
        Make a pair
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-foreground/70">
        Any shirt, any trouser, one flat price — {formatPrice(PAIR_PRICE_CENTS)}. Pick your favourites and we&rsquo;ll bundle them.
      </p>
      <div className="mt-10">
        <PairBuilder shirts={shirtsWithPhotos} trousers={trousersWithPhotos} />
      </div>
    </main>
  );
}
