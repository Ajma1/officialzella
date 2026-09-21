import { describe, it, expect } from "vitest";
import { buildOrderWhere } from "../where";

describe("buildOrderWhere", () => {
  it("returns an empty where for no params", () => {
    expect(buildOrderWhere({})).toEqual({});
  });

  it("filters by a valid status", () => {
    expect(buildOrderWhere({ status: "PENDING" })).toEqual({ status: "PENDING" });
  });

  it("ignores an invalid status value", () => {
    expect(buildOrderWhere({ status: "NOT_A_STATUS" })).toEqual({});
  });

  it("builds a date range from from/to", () => {
    const where = buildOrderWhere({ from: "2026-09-01", to: "2026-09-20" });
    expect(where.createdAt).toEqual({
      gte: new Date("2026-09-01T00:00:00"),
      lte: new Date("2026-09-20T23:59:59"),
    });
  });

  it("builds an open-ended range from just `from`", () => {
    const where = buildOrderWhere({ from: "2026-09-01" });
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00") });
  });

  it("builds a case-insensitive OR search across order number, name, phone, email", () => {
    const where = buildOrderWhere({ q: "Ava" });
    expect(where.OR).toEqual([
      { orderNumber: { contains: "Ava", mode: "insensitive" } },
      { customerName: { contains: "Ava", mode: "insensitive" } },
      { customerPhone: { contains: "Ava", mode: "insensitive" } },
      { customerEmail: { contains: "Ava", mode: "insensitive" } },
    ]);
  });

  it("trims whitespace from q and ignores an empty/whitespace-only search", () => {
    expect(buildOrderWhere({ q: "   " })).toEqual({});
  });

  it("combines status, date range, and search together", () => {
    const where = buildOrderWhere({ status: "CONFIRMED", from: "2026-09-01", q: "test" });
    expect(where.status).toBe("CONFIRMED");
    expect(where.createdAt).toEqual({ gte: new Date("2026-09-01T00:00:00") });
    expect(where.OR).toHaveLength(4);
  });
});
