import { describe, it, expect } from "vitest";
import {
  getAllProducts,
  getProductsByCategory,
  getProductBySlug,
  searchProducts,
  getRelatedProducts,
} from "@/lib/catalog";

describe("catalog", () => {
  it("returns every seed product", async () => {
    const all = await getAllProducts();
    expect(all.length).toBeGreaterThanOrEqual(9);
  });

  it("filters by category", async () => {
    const shirts = await getProductsByCategory("SHIRT");
    expect(shirts.length).toBeGreaterThan(0);
    expect(shirts.every((p) => p.category === "SHIRT")).toBe(true);
  });

  it("returns null for an unknown slug", async () => {
    expect(await getProductBySlug("does-not-exist")).toBeNull();
  });

  it("finds a product by slug", async () => {
    const all = await getAllProducts();
    const one = await getProductBySlug(all[0].slug);
    expect(one?.id).toBe(all[0].id);
  });

  it("search matches name / colorway case-insensitively", async () => {
    const results = await searchProducts("SKY");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (p) =>
          p.name.toLowerCase().includes("sky") ||
          (p.colorway?.toLowerCase().includes("sky") ?? false),
      ),
    ).toBe(true);
  });

  it("search matches category names", async () => {
    const results = await searchProducts("trouser");
    expect(results.some((p) => p.category === "TROUSER")).toBe(true);
  });

  it("search returns [] for a blank query", async () => {
    expect(await searchProducts("   ")).toEqual([]);
  });

  it("related products exclude self, share category, max 3", async () => {
    const all = await getAllProducts();
    const product = all.find((p) => p.category === "SHIRT")!;
    const related = await getRelatedProducts(product);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.every((p) => p.category === "SHIRT" && p.id !== product.id)).toBe(true);
  });
});
