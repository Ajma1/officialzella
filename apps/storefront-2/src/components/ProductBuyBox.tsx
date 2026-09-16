"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addItem } from "@zella/core/cart";
import { canAddToCart, variantStock } from "@zella/core/catalog-helpers";
import { formatPrice } from "@zella/core/format";
import type { Product, Size } from "@zella/core/catalog-types";

const SIZES: Size[] = ["S", "M"];

export default function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    const check = canAddToCart(product, size, 1);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      colorway: product.colorway,
      image: product.images[0]?.url ?? null,
      size: size!,
      priceCents: product.priceCents,
    });
    router.push("/cart");
  }

  return (
    <div>
      <p className="kicker" style={{ marginBottom: 14 }}>{product.category === "SHIRT" ? "The shirt" : "The trouser"}</p>
      <h1 style={{ fontSize: "clamp(32px, 4.4vw, 48px)", lineHeight: 1.05, margin: "0 0 14px" }}>{product.name}</h1>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "0 0 20px", fontFeatureSettings: "'tnum'" }}>
        {formatPrice(product.priceCents)}
      </p>
      <p style={{ margin: "0 0 26px", fontSize: 15, lineHeight: 1.7, color: "color-mix(in srgb, var(--color-text) 84%, transparent)" }}>
        {product.description}
      </p>

      <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 12px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
        Size
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {SIZES.map((s) => {
          const stock = variantStock(product, s);
          return (
            <button
              key={s}
              type="button"
              disabled={stock === 0}
              onClick={() => {
                setSize(s);
                setError(null);
              }}
              className="btn btn-secondary"
              style={{ padding: "11px 24px", borderColor: size === s ? "var(--color-accent)" : undefined }}
            >
              {s}
              {stock === 0 ? " · sold out" : ""}
            </button>
          );
        })}
      </div>
      <Link href="/size-guide" style={{ display: "block", marginBottom: 24, fontSize: 12 }}>
        Size chart
      </Link>

      <button type="button" onClick={handleAdd} className="btn btn-primary btn-block" style={{ padding: 14 }}>
        Add to bag
      </button>
      {error && (
        <p role="alert" style={{ marginTop: 10, fontSize: 13, color: "var(--color-accent-800)" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 22, border: "1px solid var(--color-accent-300)", borderRadius: "var(--radius-md)", padding: 20 }}>
        <p style={{ margin: "0 0 6px", fontFamily: "var(--font-heading)", fontSize: 19 }}>Make it a pair</p>
        <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "color-mix(in srgb, var(--color-text) 76%, transparent)" }}>
          Add {product.category === "SHIRT" ? "a trouser" : "a shirt"} and this becomes part of a discounted pair.
        </p>
        <Link href="/pair" className="btn btn-secondary" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Make a pair
        </Link>
      </div>
    </div>
  );
}
