import { describe, it, expect } from "vitest";
import { generateOrderNumber } from "@/lib/checkout/order-number";

describe("generateOrderNumber", () => {
  it("matches the ZELLA-XXXXX shape", () => {
    expect(generateOrderNumber()).toMatch(/^ZELLA-[0-9A-HJKMNP-TV-Z]{5}$/);
  });

  it("is practically unique across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(generateOrderNumber());
    expect(seen.size).toBeGreaterThan(1990);
  });
});
