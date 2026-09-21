import { describe, it, expect } from "vitest";
import { rangeToDates } from "../dashboard-range";

// Fixed reference instant: 2026-09-21T10:00:00Z = 2026-09-21T15:00:00+05:00 (PKT).
const NOW = new Date("2026-09-21T10:00:00Z");

describe("rangeToDates", () => {
  it("'today' starts at shop-local midnight of the current PKT day", () => {
    const { start, end } = rangeToDates("today", NOW);
    expect(start).toEqual(new Date("2026-09-21T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'7d' starts 6 days before shop-local midnight (7-day inclusive window)", () => {
    const { start, end } = rangeToDates("7d", NOW);
    expect(start).toEqual(new Date("2026-09-15T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'30d' starts 29 days before shop-local midnight (30-day inclusive window)", () => {
    const { start, end } = rangeToDates("30d", NOW);
    expect(start).toEqual(new Date("2026-08-23T00:00:00+05:00"));
    expect(end).toBeNull();
  });

  it("'all' has no date bound", () => {
    expect(rangeToDates("all", NOW)).toEqual({ start: null, end: null });
  });

  it("'today' rolls to the correct PKT date even when UTC is still the previous day", () => {
    // 2026-09-21T20:00:00Z = 2026-09-22T01:00:00+05:00 — PKT date is the 22nd.
    const lateUtc = new Date("2026-09-21T20:00:00Z");
    const { start } = rangeToDates("today", lateUtc);
    expect(start).toEqual(new Date("2026-09-22T00:00:00+05:00"));
  });
});
