import { describe, it, expect } from "vitest";
import { revalidateCart } from "../revalidate-cart";
import { PAIR_PRICE_CENTS } from "../../checkout/pairing";
import type { CartItem } from "../../cart/store";

// Real catalog products (packages/db/prisma/seed.ts).
const SHIRT_SLUG = "powder-blue-stripe-shirt";
const SHIRT_PRICE_CENTS = 285000;
const TROUSER_SLUG = "ivory-wide-leg-trouser";

const line = (over: Partial<CartItem> = {}): CartItem => ({
  productId: "test-fixture",
  slug: SHIRT_SLUG,
  name: "Powder Blue Stripe",
  colorway: "Powder Blue Stripe",
  image: null,
  size: "M",
  priceCents: SHIRT_PRICE_CENTS,
  qty: 1,
  ...over,
});

describe("revalidateCart", () => {
  it("passes a clean cart", async () => {
    const r = await revalidateCart([line()]);
    expect(r.hasCorrections).toBe(false);
    expect(r.lines[0].ok).toBe(true);
    expect(r.subtotalCents).toBe(SHIRT_PRICE_CENTS);
  });

  it("flags a price change and uses the source price for the subtotal", async () => {
    const r = await revalidateCart([line({ priceCents: 999, qty: 2 })]);
    expect(r.lines[0].priceChanged).toEqual({ from: 999, to: SHIRT_PRICE_CENTS });
    expect(r.hasCorrections).toBe(true);
    expect(r.subtotalCents).toBe(SHIRT_PRICE_CENTS * 2);
  });

  it("flags an unknown product as unavailable", async () => {
    const r = await revalidateCart([line({ slug: "ghost-shirt" })]);
    expect(r.lines[0].unavailable).toBe(true);
    expect(r.subtotalCents).toBe(0);
  });

  it("flags a line that exceeds stock as unavailable", async () => {
    const r = await revalidateCart([line({ qty: 999 })]);
    expect(r.lines[0].unavailable).toBe(true);
  });

  it("prices a pair line at the flat bundle price, not the sum of parts", async () => {
    const pairLine = line({
      priceCents: PAIR_PRICE_CENTS,
      pair: { productId: "test-fixture-trouser", slug: TROUSER_SLUG, name: "Ivory Wide-Leg", image: null },
    });
    const r = await revalidateCart([pairLine]);
    expect(r.lines[0].ok).toBe(true);
    expect(r.lines[0].priceChanged).toBeUndefined();
    expect(r.subtotalCents).toBe(PAIR_PRICE_CENTS);
  });

  it("flags a pair as unavailable when the trouser side doesn't exist, even though the shirt is fine", async () => {
    const pairLine = line({
      pair: { productId: "test-fixture-trouser", slug: "ghost-trouser", name: "Ghost", image: null },
    });
    const r = await revalidateCart([pairLine]);
    expect(r.lines[0].unavailable).toBe(true);
  });
});
