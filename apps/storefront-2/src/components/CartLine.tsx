"use client";

import Image from "next/image";
import { setItemQty, removeItem, type CartItem } from "@zella/core/cart";
import { formatPrice } from "@zella/core/format";

function Thumb({ src, size }: { src: string | null; size: number }) {
  if (!src) return <span style={{ width: size, aspectRatio: "3 / 4", display: "block", background: "var(--color-surface)" }} />;
  return (
    <div className="plate" style={{ position: "relative", width: size, aspectRatio: "3 / 4", flexShrink: 0 }}>
      <Image src={src} alt="" fill sizes={`${size}px`} style={{ objectFit: "cover" }} />
    </div>
  );
}

export default function CartLine({ item }: { item: CartItem }) {
  const pairId = item.pair?.productId;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: 18, alignItems: "start", padding: "20px 0", borderTop: "1px solid var(--color-divider)" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Thumb src={item.image} size={item.pair ? 60 : 88} />
        {item.pair && <Thumb src={item.pair.image} size={60} />}
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontFamily: "var(--font-heading)", fontSize: 19, lineHeight: 1.25 }}>
          {item.pair ? `${item.name} + ${item.pair.name}` : item.name}
        </p>
        {item.pair && (
          <p style={{ margin: "0 0 4px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>
            Pair
          </p>
        )}
        <p style={{ margin: "0 0 10px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
          Size {item.size}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setItemQty(item.productId, item.size, item.qty - 1, pairId)} className="btn btn-secondary" style={{ padding: "4px 11px", fontSize: 14 }}>
            &minus;
          </button>
          <span style={{ fontSize: 13, minWidth: 18, textAlign: "center", fontFeatureSettings: "'tnum'" }}>{item.qty}</span>
          <button type="button" onClick={() => setItemQty(item.productId, item.size, item.qty + 1, pairId)} className="btn btn-secondary" style={{ padding: "4px 11px", fontSize: 14 }}>
            +
          </button>
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.size, pairId)}
            style={{ background: "none", border: 0, padding: "0 0 0 8px", display: "flex", alignItems: "center", minHeight: 44, cursor: "pointer", fontSize: 12, color: "color-mix(in srgb, var(--color-text) 58%, transparent)", textDecoration: "underline" }}
          >
            Remove
          </button>
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 19, whiteSpace: "nowrap", fontFeatureSettings: "'tnum'" }}>
        {formatPrice(item.priceCents * item.qty)}
      </p>
    </div>
  );
}
