import { describe, it, expect } from "vitest";
import { shopDateKey } from "../shop-timezone";

describe("shopDateKey", () => {
  it("returns the same calendar date for a UTC instant well within the PKT day", () => {
    // 2026-09-10T10:00:00Z = 2026-09-10T15:00:00+05:00 — same PKT date.
    expect(shopDateKey(new Date("2026-09-10T10:00:00Z"))).toBe("2026-09-10");
  });

  it("rolls forward to the next PKT date for a late-UTC instant", () => {
    // 2026-09-10T20:00:00Z = 2026-09-11T01:00:00+05:00 — next PKT date.
    expect(shopDateKey(new Date("2026-09-10T20:00:00Z"))).toBe("2026-09-11");
  });

  it("rolls back to the previous PKT date for an early-UTC instant", () => {
    // 2026-09-10T02:00:00Z = 2026-09-10T07:00:00+05:00 — same PKT date, but
    // 2026-09-09T23:00:00Z = 2026-09-10T04:00:00+05:00 is still the 10th in
    // PKT despite being the 9th in UTC — the case this offset exists for.
    expect(shopDateKey(new Date("2026-09-09T23:00:00Z"))).toBe("2026-09-10");
  });
});
