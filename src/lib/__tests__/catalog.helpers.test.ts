import { describe, it, expect } from "vitest";
import type { Product } from "@/data/catalog.seed";
import {
  isSoldOut,
  variantStock,
  canAddToCart,
  sortProducts,
} from "@/lib/catalog.helpers";

function make(overrides: Partial<Product>): Product {
  return {
    id: "p",
    slug: "p",
    name: "P",
    description: "",
    category: "SHIRT",
    colorway: null,
    colorwaySwatch: "#000",
    priceCents: 1000,
    images: [],
    variants: [
      { size: "S", stock: 2 },
      { size: "M", stock: 0 },
    ],
    ...overrides,
  };
}

describe("isSoldOut", () => {
  it("is true when every variant is out of stock", () => {
    expect(isSoldOut(make({ variants: [{ size: "S", stock: 0 }, { size: "M", stock: 0 }] }))).toBe(true);
  });
  it("is false when any variant has stock", () => {
    expect(isSoldOut(make({}))).toBe(false);
  });
});

describe("variantStock", () => {
  it("returns the stock for a present size", () => {
    expect(variantStock(make({}), "S")).toBe(2);
  });
  it("returns 0 for an absent size", () => {
    expect(variantStock(make({}), "XL")).toBe(0);
  });
});

describe("canAddToCart", () => {
  it("rejects a null size", () => {
    expect(canAddToCart(make({}), null, 1)).toEqual({ ok: false, error: "Pick a size first" });
  });
  it("rejects qty above stock", () => {
    const r = canAddToCart(make({}), "S", 3);
    expect(r.ok).toBe(false);
  });
  it("rejects qty below 1", () => {
    expect(canAddToCart(make({}), "S", 0).ok).toBe(false);
  });
  it("accepts an in-stock qty", () => {
    expect(canAddToCart(make({}), "S", 2)).toEqual({ ok: true });
  });
});

describe("sortProducts", () => {
  const a = make({ id: "a", priceCents: 3000 });
  const b = make({ id: "b", priceCents: 1000 });
  const c = make({ id: "c", priceCents: 2000, isNew: true });
  const list = [a, b, c];

  it("sorts price ascending without mutating the input", () => {
    const sorted = sortProducts(list, "price-asc");
    expect(sorted.map((p) => p.id)).toEqual(["b", "c", "a"]);
    expect(list.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
  it("sorts price descending", () => {
    expect(sortProducts(list, "price-desc").map((p) => p.id)).toEqual(["a", "c", "b"]);
  });
  it("puts new products first for the 'new' sort, keeping source order otherwise", () => {
    expect(sortProducts(list, "new").map((p) => p.id)).toEqual(["c", "a", "b"]);
  });
});
