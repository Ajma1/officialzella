import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => import("../../test/cookie-jar"));
vi.mock("../../email", () => ({ sendLoginPin: vi.fn() }));

import { placeOrder } from "../place-order";
import { requestPin, verifyPin } from "../customer-auth";
import { sendLoginPin } from "../../email";
import { SHIPPING_CENTS } from "../../checkout/shipping";
import type { CartItem } from "../../cart/store";
import { __resetCookieJar } from "../../test/cookie-jar";

// Real catalog product (packages/db/prisma/seed.ts) — Powder Blue Stripe
// shirt, flat Rs 2,850.
const SHIRT_SLUG = "powder-blue-stripe-shirt";
const SHIRT_PRICE_CENTS = 285000;

const cartLine = (over: Partial<CartItem> = {}): CartItem => ({
  productId: "test-fixture",
  slug: SHIRT_SLUG,
  name: "Powder Blue Stripe",
  colorway: "Powder Blue Stripe",
  image: null,
  size: "M",
  priceCents: SHIRT_PRICE_CENTS,
  qty: 2,
  ...over,
});

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const uniqueEmail = (tag: string) =>
  `checkout-${tag}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const fields = (email: string) => ({
  fullName: "Ava Lin",
  phone: "+1 202 555 0142",
  email,
  line1: "12 Cotton Lane",
  city: "Portland",
  country: "Pakistan",
});

async function verifySession(email: string) {
  await requestPin(undefined, form({ email }));
  const calls = vi.mocked(sendLoginPin).mock.calls;
  const pin = calls[calls.length - 1][1];
  const res = await verifyPin(undefined, form({ email, code: pin }));
  if (!res?.ok) throw new Error("test setup: pin verification failed");
}

beforeEach(() => {
  __resetCookieJar();
  vi.mocked(sendLoginPin).mockClear();
});

describe("placeOrder", () => {
  it("rejects an order with no verified session", async () => {
    const email = uniqueEmail("unverified");
    const res = await placeOrder(undefined, form({ ...fields(email), items: "[]" }));
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.email).toBeTruthy();
  });

  it("returns field errors for an invalid form", async () => {
    const email = uniqueEmail("invalid-form");
    await verifySession(email);
    const res = await placeOrder(undefined, form({ ...fields(email), fullName: "" }));
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.fullName).toBeTruthy();
  });

  it("rejects an empty bag", async () => {
    const email = uniqueEmail("empty-bag");
    await verifySession(email);
    const res = await placeOrder(undefined, form({ ...fields(email), items: "[]" }));
    expect(res).toEqual({ ok: false, error: "Your bag is empty." });
  });

  it("rejects an unavailable line", async () => {
    const email = uniqueEmail("unavailable");
    await verifySession(email);
    const res = await placeOrder(
      undefined,
      form({ ...fields(email), items: JSON.stringify([cartLine({ slug: "ghost" })]) }),
    );
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.error).toMatch(/no longer available/i);
  });

  it("places a valid order with a source-priced total and a well-formed number", async () => {
    const email = uniqueEmail("valid");
    await verifySession(email);
    const res = await placeOrder(
      undefined,
      form({
        ...fields(email),
        items: JSON.stringify([cartLine({ priceCents: 1 })]), // tampered client price
      }),
    );
    expect(res?.ok).toBe(true);
    if (res?.ok) {
      // source price (not the client's 1) × 2, plus flat delivery
      expect(res.totalCents).toBe(SHIRT_PRICE_CENTS * 2 + SHIPPING_CENTS);
      expect(res.orderNumber).toMatch(/^ZELLA-[0-9A-HJKMNP-TV-Z]{5}$/);
    }
  });
});
