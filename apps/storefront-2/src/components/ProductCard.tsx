import Link from "next/link";
import ProductPlate from "./ProductPlate";
import { formatPrice } from "@zella/core/format";
import type { Product } from "@zella/core/catalog-types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="product-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ProductPlate
        src={product.images[0]?.url ?? null}
        alt={`Zella ${product.name}`}
        swatch={product.colorwaySwatch}
        ratio={product.category === "TROUSER" ? "5 / 8" : "3 / 4"}
      />
      <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, lineHeight: 1.2 }}>{product.name}</span>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: "color-mix(in srgb, var(--color-text) 72%, transparent)" }}>
          {product.description.split(".")[0]}.
        </span>
        <span style={{ fontSize: 13, fontFeatureSettings: "'tnum'" }}>{formatPrice(product.priceCents)}</span>
      </span>
    </Link>
  );
}
