import { describe, it, expect } from "vitest";
import { toDisplayUnits } from "@/lib/units";

describe("toDisplayUnits", () => {
  it("returns whole centimetres", () => {
    expect(toDisplayUnits(96, "cm")).toBe("96");
    expect(toDisplayUnits(96.4, "cm")).toBe("96");
  });
  it("converts to inches with one decimal", () => {
    expect(toDisplayUnits(2.54, "in")).toBe("1.0");
    expect(toDisplayUnits(100, "in")).toBe("39.4");
  });
});
