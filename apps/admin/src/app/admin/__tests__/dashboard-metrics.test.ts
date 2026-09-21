import { describe, it, expect } from "vitest";
import { sumRevenue, averageOrderValue, rankSellers } from "../dashboard-metrics";

describe("sumRevenue", () => {
  it("sums totalCents across orders", () => {
    expect(sumRevenue([{ totalCents: 100 }, { totalCents: 250 }])).toBe(350);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenue([])).toBe(0);
  });
});

describe("averageOrderValue", () => {
  it("divides revenue by order count, rounded", () => {
    expect(averageOrderValue(1000, 3)).toBe(333);
  });

  it("returns 0 when there are no orders (avoids division by zero)", () => {
    expect(averageOrderValue(0, 0)).toBe(0);
  });
});

describe("rankSellers", () => {
  it("aggregates revenue as priceCents * quantity, not priceCents alone", () => {
    const ranked = rankSellers([
      { productId: "p1", productName: "Shirt", quantity: 2, priceCents: 1000 },
    ]);
    expect(ranked[0].revenueCents).toBe(2000);
    expect(ranked[0].units).toBe(2);
  });

  it("combines multiple order-item rows for the same product", () => {
    const ranked = rankSellers([
      { productId: "p1", productName: "Shirt", quantity: 1, priceCents: 1000 },
      { productId: "p1", productName: "Shirt", quantity: 2, priceCents: 1000 },
    ]);
    expect(ranked[0].units).toBe(3);
    expect(ranked[0].revenueCents).toBe(3000);
  });

  it("sorts descending by units", () => {
    const ranked = rankSellers([
      { productId: "p1", productName: "A", quantity: 1, priceCents: 100 },
      { productId: "p2", productName: "B", quantity: 5, priceCents: 100 },
    ]);
    expect(ranked.map((r) => r.productId)).toEqual(["p2", "p1"]);
  });
});
