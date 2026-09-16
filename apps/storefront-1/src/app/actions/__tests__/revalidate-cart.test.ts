import { describe, it, expect } from "vitest";
import { revalidateCart } from "@/app/actions/revalidate-cart";
import { SEED_PRODUCTS } from "@/data/catalog.seed";
import type { CartItem } from "@/lib/cart/store";

const shirt = SEED_PRODUCTS.find((p) => p.slug === "sky-stripe-shirt")!;

const line = (over: Partial<CartItem> = {}): CartItem => ({
  productId: shirt.id,
  slug: shirt.slug,
  name: shirt.name,
  colorway: shirt.colorway,
  image: null,
  size: "M",
  priceCents: shirt.priceCents,
  qty: 1,
  ...over,
});

describe("revalidateCart", () => {
  it("passes a clean cart", async () => {
    const r = await revalidateCart([line()]);
    expect(r.hasCorrections).toBe(false);
    expect(r.lines[0].ok).toBe(true);
    expect(r.subtotalCents).toBe(shirt.priceCents);
  });

  it("flags a price change and uses the source price for the subtotal", async () => {
    const r = await revalidateCart([line({ priceCents: 999, qty: 2 })]);
    expect(r.lines[0].priceChanged).toEqual({ from: 999, to: shirt.priceCents });
    expect(r.hasCorrections).toBe(true);
    expect(r.subtotalCents).toBe(shirt.priceCents * 2);
  });

  it("flags an unknown product as unavailable", async () => {
    const r = await revalidateCart([line({ slug: "ghost-shirt" })]);
    expect(r.lines[0].unavailable).toBe(true);
    expect(r.subtotalCents).toBe(0);
  });

  it("flags a line that exceeds stock as unavailable", async () => {
    const r = await revalidateCart([line({ size: "XS", qty: 999 })]);
    expect(r.lines[0].unavailable).toBe(true);
  });
});
