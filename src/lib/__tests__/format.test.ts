import { describe, it, expect } from "vitest";
import { formatPrice, formatCents } from "@/lib/format";

describe("formatPrice", () => {
  it("renders PKR whole rupees with a thousands separator", () => {
    expect(formatPrice(299000)).toBe("Rs 2,990");
    expect(formatPrice(25000)).toBe("Rs 250");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("Rs 0");
  });
  it("rounds paisa to the nearest rupee", () => {
    expect(formatPrice(249049)).toBe("Rs 2,490");
  });
});

describe("formatCents", () => {
  it("is unchanged for the admin views", () => {
    expect(formatCents(249000)).toBe("2490.00");
  });
});
