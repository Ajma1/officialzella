import { describe, it, expect } from "vitest";
import { formatPrice, formatCents } from "@/lib/format";

describe("formatPrice", () => {
  it("prefixes the currency symbol and keeps two decimals", () => {
    expect(formatPrice(2400)).toBe("$24.00");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
  it("builds on formatCents", () => {
    expect(formatPrice(3250)).toBe(`$${formatCents(3250)}`);
  });
});
