import { describe, it, expect, beforeEach } from "vitest";
import {
  addItem,
  setItemQty,
  removeItem,
  clearCart,
  getSnapshot,
  getCount,
  getSubtotalCents,
  __resetCartForTests,
  type CartItem,
} from "@/lib/cart/store";

class FakeStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
  key() {
    return null;
  }
  get length() {
    return this.map.size;
  }
}

const line = (over: Partial<Omit<CartItem, "qty">> = {}): Omit<CartItem, "qty"> => ({
  productId: "p1",
  slug: "p1",
  name: "Shirt",
  colorway: "Sky",
  image: null,
  size: "M",
  priceCents: 2400,
  ...over,
});

beforeEach(() => {
  __resetCartForTests();
  (globalThis as { localStorage?: unknown }).localStorage = new FakeStorage();
});

describe("cart store", () => {
  it("adds a line", () => {
    addItem(line(), 2);
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].qty).toBe(2);
  });

  it("merges a matching product + size", () => {
    addItem(line(), 1);
    addItem(line(), 3);
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].qty).toBe(4);
  });

  it("keeps different sizes as separate lines", () => {
    addItem(line({ size: "M" }), 1);
    addItem(line({ size: "L" }), 1);
    expect(getSnapshot()).toHaveLength(2);
  });

  it("clamps qty to the 1..10 range", () => {
    addItem(line(), 50);
    expect(getSnapshot()[0].qty).toBe(10);
    setItemQty("p1", "M", 0);
    expect(getSnapshot()[0].qty).toBe(1);
  });

  it("removes a line", () => {
    addItem(line(), 1);
    removeItem("p1", "M");
    expect(getSnapshot()).toHaveLength(0);
  });

  it("computes count and subtotal", () => {
    addItem(line({ productId: "a", size: "S", priceCents: 1000 }), 2);
    addItem(line({ productId: "b", size: "M", priceCents: 500 }), 3);
    const items = getSnapshot();
    expect(getCount(items)).toBe(5);
    expect(getSubtotalCents(items)).toBe(2 * 1000 + 3 * 500);
  });

  it("persists across a fresh module read", () => {
    addItem(line(), 2);
    __resetCartForTests(); // simulate reload; storage stays
    expect(getSnapshot()[0].qty).toBe(2);
  });

  it("returns [] when localStorage holds corrupt JSON", () => {
    (globalThis as { localStorage: Storage }).localStorage.setItem(
      "zella-cart",
      "{not json",
    );
    __resetCartForTests();
    expect(getSnapshot()).toEqual([]);
  });

  it("clears the cart", () => {
    addItem(line(), 1);
    clearCart();
    expect(getSnapshot()).toHaveLength(0);
  });
});
