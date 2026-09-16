"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem } from "@zella/core/cart";
import { formatPrice } from "@zella/core/format";
import { SHIPPING_CENTS } from "@zella/core/checkout";

interface LastOrder {
  orderNumber: string;
  totalCents: number;
  email: string;
  items: CartItem[];
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let parsed: LastOrder | null = null;
    try {
      const raw = sessionStorage.getItem("zella-last-order");
      if (raw) parsed = JSON.parse(raw) as LastOrder;
    } catch {
      /* private mode */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(parsed);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!order) {
    return (
      <main className="container-narrow" style={{ padding: "96px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 15 }}>Nothing to show here — your order confirmation has already been and gone.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 20, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Back to the edit
        </Link>
      </main>
    );
  }

  return (
    <main className="container-narrow" style={{ padding: "96px 28px 116px", textAlign: "center" }}>
      <p className="kicker">Order placed</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.06, margin: "0 0 20px" }}>Thank you — it&rsquo;s on its way.</h1>
      <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        We&rsquo;ll call to confirm before it ships.
      </p>
      <p style={{ margin: "0 0 32px", fontFamily: "var(--font-heading)", fontSize: 22 }}>{order.orderNumber}</p>

      <div style={{ textAlign: "left", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 24, marginBottom: 32 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", borderTop: i === 0 ? undefined : "1px solid var(--color-divider)" }}>
            <span>
              {item.pair ? `${item.name} + ${item.pair.name}` : item.name} · {item.size} × {item.qty}
            </span>
            <span style={{ fontFeatureSettings: "'tnum'" }}>{formatPrice(item.priceCents * item.qty)}</span>
          </div>
        ))}
        <hr className="hr" />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
          <span>Delivery</span>
          <span>{formatPrice(SHIPPING_CENTS)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--color-accent-700)" }}>
          <span>Total (cash on delivery)</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <Link href="/" className="btn btn-primary" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
        Continue shopping
      </Link>
    </main>
  );
}
