"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addItem } from "@zella/core/cart";
import { formatPrice } from "@zella/core/format";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import type { Product } from "@zella/core/catalog-types";
import ProductPlate from "./ProductPlate";

const SIZES = ["S", "M"] as const;

function PickerRow({
  label,
  items,
  selectedId,
  onPick,
  ratio,
}: {
  label: string;
  items: Product[];
  selectedId: string;
  onPick: (id: string) => void;
  ratio: string;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          margin: "0 0 16px",
          paddingBottom: 12,
          borderBottom: "1px solid var(--color-divider)",
          color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
        }}
      >
        {label}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16 }}>
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ boxShadow: selected ? "inset 0 0 0 2px var(--color-accent)" : "none", borderRadius: 2 }}>
                <ProductPlate src={item.images[0]?.url ?? null} alt={item.name} swatch={item.colorwaySwatch} ratio={ratio} />
              </div>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: selected ? "var(--color-accent-700)" : "color-mix(in srgb, var(--color-text) 64%, transparent)",
                }}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PairBuilder({ shirts, trousers }: { shirts: Product[]; trousers: Product[] }) {
  const router = useRouter();
  const [shirtId, setShirtId] = useState(shirts[0]?.id ?? "");
  const [trouserId, setTrouserId] = useState(trousers[0]?.id ?? "");
  const [size, setSize] = useState<(typeof SIZES)[number]>("S");

  const shirt = shirts.find((p) => p.id === shirtId) ?? shirts[0];
  const trouser = trousers.find((p) => p.id === trouserId) ?? trousers[0];

  if (!shirt || !trouser) {
    return <p className="text-muted">Photography is still being shot for enough pieces to build a pair — check back soon.</p>;
  }

  const wasCents = shirt.priceCents + trouser.priceCents;

  function handleAdd() {
    addItem({
      productId: shirt.id,
      slug: shirt.slug,
      name: shirt.name,
      colorway: shirt.colorway,
      image: shirt.images[0]?.url ?? null,
      size,
      priceCents: PAIR_PRICE_CENTS,
      pair: {
        productId: trouser.id,
        slug: trouser.slug,
        name: trouser.name,
        image: trouser.images[0]?.url ?? null,
      },
    });
    router.push("/cart");
  }

  return (
    <div className="grid-split" style={{ "--sidebar-w": "320px", gap: 46 } as React.CSSProperties}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <PickerRow label="The shirt" items={shirts} selectedId={shirt.id} onPick={setShirtId} ratio="3 / 4" />
        <PickerRow label="The trouser" items={trousers} selectedId={trouser.id} onPick={setTrouserId} ratio="5 / 8" />
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              margin: "0 0 16px",
              paddingBottom: 12,
              borderBottom: "1px solid var(--color-divider)",
              color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
            }}
          >
            The size
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className="btn btn-secondary"
                style={{ borderColor: size === s ? "var(--color-accent)" : undefined, padding: "12px 26px" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside
        style={{
          border: "1px solid var(--color-divider)",
          borderRadius: "var(--radius-md)",
          padding: 26,
          background: "var(--color-surface)",
          position: "sticky",
          top: 104,
        }}
      >
        <div className="grid-2" style={{ marginBottom: 22 }}>
          <ProductPlate src={shirt.images[0]?.url ?? null} alt={shirt.name} swatch={shirt.colorwaySwatch} ratio="3 / 4" />
          <ProductPlate src={trouser.images[0]?.url ?? null} alt={trouser.name} swatch={trouser.colorwaySwatch} ratio="5 / 8" />
        </div>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 20, lineHeight: 1.25, margin: "0 0 3px" }}>{shirt.name}</p>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 20, lineHeight: 1.25, margin: "0 0 20px" }}>{trouser.name}</p>
        <hr className="hr" />
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, textDecoration: "line-through", color: "color-mix(in srgb, var(--color-text) 52%, transparent)" }}>
            {formatPrice(wasCents)}
          </span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 38, lineHeight: 1 }}>{formatPrice(PAIR_PRICE_CENTS)}</span>
        </div>
        <p style={{ fontSize: 12, margin: "12px 0 0", color: "color-mix(in srgb, var(--color-text) 68%, transparent)" }}>Size {size}</p>
        <button type="button" onClick={handleAdd} className="btn btn-primary btn-block" style={{ padding: 14 }}>
          Add to bag
        </button>
      </aside>
    </div>
  );
}
