import { describe, it, expect } from "vitest";
import { isRateLimited } from "../rate-limit";

describe("isRateLimited", () => {
  it("blocks a submission within the window", () => {
    expect(isRateLimited(1_000_030_000, 1_000_000_000, 60_000)).toBe(true);
  });

  it("allows a submission after the window has fully elapsed", () => {
    expect(isRateLimited(1_000_061_000, 1_000_000_000, 60_000)).toBe(false);
  });

  it("allows a first-ever submission with no prior timestamp", () => {
    expect(isRateLimited(1_000_000_000, undefined, 60_000)).toBe(false);
  });
});
