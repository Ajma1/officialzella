import { describe, it, expect } from "vitest";
import { revalidateCart } from "@/app/actions/revalidate-cart";
import type { CartItem } from "@/lib/cart/store";

// Real catalog product (packages/db/prisma/seed.ts) — Powder Blue Stripe
// shirt, flat Rs 2,850.
const SHIRT_SLUG = "powder-blue-stripe-shirt";
const SHIRT_PRICE_CENTS = 285000;

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
});
