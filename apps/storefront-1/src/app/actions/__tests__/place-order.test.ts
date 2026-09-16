import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => import("@/test/cookie-jar"));
vi.mock("@/lib/email", () => ({ sendLoginPin: vi.fn() }));

import { placeOrder } from "@/app/actions/place-order";
import { requestPin, verifyPin } from "@/app/actions/customer-auth";
import { sendLoginPin } from "@/lib/email";
import { SHIPPING_CENTS } from "@/lib/checkout/shipping";
import { SEED_PRODUCTS } from "@/data/catalog.seed";
import type { CartItem } from "@/lib/cart/store";
import { __resetCookieJar } from "@/test/cookie-jar";

const shirt = SEED_PRODUCTS.find((p) => p.slug === "sky-stripe-shirt")!;

const cartLine = (over: Partial<CartItem> = {}): CartItem => ({
  productId: shirt.id,
  slug: shirt.slug,
  name: shirt.name,
  colorway: shirt.colorway,
  image: null,
  size: "M",
  priceCents: shirt.priceCents,
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
      expect(res.totalCents).toBe(shirt.priceCents * 2 + SHIPPING_CENTS);
      expect(res.orderNumber).toMatch(/^ZELLA-[0-9A-HJKMNP-TV-Z]{5}$/);
    }
  });
});
