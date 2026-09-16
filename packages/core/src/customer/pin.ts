import crypto from "node:crypto";

const PIN_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const REQUEST_COOLDOWN_MS = 60 * 1000;
const REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

function pepper() {
  const p = process.env.PIN_PEPPER;
  if (!p) throw new Error("PIN_PEPPER is not set");
  return p;
}

export function generatePin(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin + pepper()).digest("hex");
}

export function pinExpiresAt(): Date {
  return new Date(Date.now() + PIN_TTL_MS);
}

export function verifyPinHash(pin: string, hash: string): boolean {
  const a = Buffer.from(hashPin(pin), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export { MAX_ATTEMPTS, REQUEST_COOLDOWN_MS, REQUEST_WINDOW_MS, MAX_REQUESTS_PER_WINDOW };
