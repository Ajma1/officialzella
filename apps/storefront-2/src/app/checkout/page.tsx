"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@zella/core/cart";
import { placeOrder, revalidateCart, type RevalidateResult } from "@zella/core/actions";
import { SHIPPING_CENTS, orderTotalCents } from "@zella/core/checkout";
import { formatPrice } from "@zella/core/format";
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, undefined);
  const [reval, setReval] = useState<RevalidateResult | null>(null);
  const orderedRef = useRef(false);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const generalError = state && !state.ok ? state.error : undefined;

  useEffect(() => {
    const parsed: typeof items = JSON.parse(itemsJson);
    if (parsed.length === 0) return;
    let cancelled = false;
    revalidateCart(parsed).then((r) => {
      if (!cancelled) setReval(r);
    });
    return () => {
      cancelled = true;
    };
  }, [itemsJson]);

  useEffect(() => {
    if (state?.ok && !orderedRef.current) {
      orderedRef.current = true;
      try {
        sessionStorage.setItem(
          "zella-last-order",
          JSON.stringify({
            orderNumber: state.orderNumber,
            totalCents: state.totalCents,
            email: state.email,
            items: JSON.parse(itemsJson),
          }),
        );
      } catch {
        /* private mode */
      }
      clear();
      router.push("/checkout/confirmation");
    }
  }, [state, itemsJson, clear, router]);

  useEffect(() => {
    if (orderedRef.current || items.length > 0) return;
    const t = window.setTimeout(() => {
      if (!orderedRef.current) router.replace("/cart");
    }, 250);
    return () => window.clearTimeout(t);
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <main className="container-narrow" style={{ padding: "96px 28px", textAlign: "center" }}>
        <p className="text-muted">loading your bag…</p>
      </main>
    );
  }

  const unavailable = reval?.lines.filter((l) => l.unavailable).length ?? 0;
  const summaryNote = generalError ?? (unavailable > 0 ? "An item in your bag is no longer available — review your bag." : undefined);
  const total = orderTotalCents(reval?.subtotalCents ?? subtotalCents);

  return (
    <main className="container" style={{ padding: "50px 28px 76px" }}>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 30px" }}>Checkout</h1>
      <form action={formAction} className="grid-split">
        <input type="hidden" name="items" value={itemsJson} />
        <CheckoutForm errors={fieldErrors} />

        <aside style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 24, background: "var(--color-surface)", position: "sticky", top: 104 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 18px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
            Order
          </p>
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.pair?.productId ?? ""}`} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 13, marginBottom: 12, fontFeatureSettings: "'tnum'" }}>
              <span>
                {item.pair ? `${item.name} + ${item.pair.name}` : item.name} &times; {item.qty}
              </span>
              <span>{formatPrice(item.priceCents * item.qty)}</span>
            </div>
          ))}
          <hr className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, fontFeatureSettings: "'tnum'" }}>
            <span>Subtotal</span>
            <span>{formatPrice(reval?.subtotalCents ?? subtotalCents)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFeatureSettings: "'tnum'" }}>
            <span>Delivery</span>
            <span>{formatPrice(SHIPPING_CENTS)}</span>
          </div>
          <hr className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>Total</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontFeatureSettings: "'tnum'" }}>{formatPrice(total)}</span>
          </div>
          {summaryNote && (
            <p role="status" style={{ marginTop: 12, fontSize: 12, color: "var(--color-accent-800)" }}>
              {summaryNote}
            </p>
          )}
          <button type="submit" disabled={pending || unavailable > 0} className="btn btn-primary btn-block" style={{ marginTop: 22, padding: 14, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {pending ? "Placing…" : "Place the order"}
          </button>
        </aside>
      </form>
    </main>
  );
}
