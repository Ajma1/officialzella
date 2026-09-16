import { describe, it, expect, beforeAll } from "vitest";
import {
  generatePin,
  hashPin,
  pinExpiresAt,
  verifyPinHash,
} from "../pin";

beforeAll(() => {
  process.env.PIN_PEPPER = "test-pepper";
});

describe("pin", () => {
  it("generates a zero-padded 6-digit code", () => {
    for (let i = 0; i < 20; i++) {
      expect(generatePin()).toMatch(/^\d{6}$/);
    }
  });

  it("hashes deterministically and verifies the matching code", () => {
    const pin = "042819";
    const hash = hashPin(pin);
    expect(hash).toBe(hashPin(pin));
    expect(verifyPinHash(pin, hash)).toBe(true);
  });

  it("rejects a wrong code", () => {
    const hash = hashPin("111111");
    expect(verifyPinHash("222222", hash)).toBe(false);
  });

  it("hashes differently under a different pepper", () => {
    const hash = hashPin("123456");
    process.env.PIN_PEPPER = "different-pepper";
    expect(hashPin("123456")).not.toBe(hash);
    process.env.PIN_PEPPER = "test-pepper";
  });

  it("sets expiry ~10 minutes out", () => {
    const expires = pinExpiresAt();
    const deltaMs = expires.getTime() - Date.now();
    expect(deltaMs).toBeGreaterThan(9 * 60 * 1000);
    expect(deltaMs).toBeLessThanOrEqual(10 * 60 * 1000);
  });
});
