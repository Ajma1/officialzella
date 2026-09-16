"use client";

import Link from "next/link";
import { useCart } from "@zella/core/cart";
import { SHIPPING_CENTS, orderTotalCents } from "@zella/core/checkout";
import { formatPrice } from "@zella/core/format";
import CartLine from "@/components/CartLine";

export default function CartPage() {
  const { items, subtotalCents } = useCart();

  return (
    <section className="container-narrow" style={{ padding: "50px 28px 76px" }}>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 30px" }}>Your bag</h1>

      {items.length === 0 ? (
        <div style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 44, textAlign: "center" }}>
          <p style={{ margin: "0 0 20px", fontSize: 15, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>Nothing here yet.</p>
          <Link href="/pair" className="btn btn-primary" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Make a pair
          </Link>
        </div>
      ) : (
        <div className="grid-split">
          <div>
            {items.map((item) => (
              <CartLine key={`${item.productId}-${item.size}-${item.pair?.productId ?? ""}`} item={item} />
            ))}
          </div>

          <aside style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 24, background: "var(--color-surface)", position: "sticky", top: 104 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 18px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
              Order
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, fontFeatureSettings: "'tnum'" }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, fontFeatureSettings: "'tnum'" }}>
              <span>Delivery</span>
              <span>{formatPrice(SHIPPING_CENTS)}</span>
            </div>
            <hr className="hr" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontFeatureSettings: "'tnum'" }}>
                {formatPrice(orderTotalCents(subtotalCents))}
              </span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 22, padding: 14, letterSpacing: "0.16em", textTransform: "uppercase", textAlign: "center" }}>
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
