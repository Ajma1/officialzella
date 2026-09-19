import { describe, it, expect } from "vitest";

import { prisma } from "@zella/db";
import { placeOrder } from "../place-order";
import { SHIPPING_CENTS } from "../../checkout/shipping";
import { PAIR_PRICE_CENTS } from "../../checkout/pairing";
import type { CartItem } from "../../cart/store";

// Real catalog products (packages/db/prisma/seed.ts).
const SHIRT_SLUG = "powder-blue-stripe-shirt";
const SHIRT_PRICE_CENTS = 285000;
const TROUSER_SLUG = "ivory-wide-leg-trouser";
const TROUSER_PRICE_CENTS = 325000;

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

describe("placeOrder", () => {
  it("places an order with no verified session, unlinked to any customer", async () => {
    const email = uniqueEmail("guest");
    const res = await placeOrder(
      undefined,
      form({ ...fields(email), items: JSON.stringify([cartLine()]) }),
    );
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: res.orderNumber } });
    expect(order.customerId).toBeNull();
  });

  it("returns field errors for an invalid form", async () => {
    const email = uniqueEmail("invalid-form");
    const res = await placeOrder(undefined, form({ ...fields(email), fullName: "" }));
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.fullName).toBeTruthy();
  });

  it("rejects an empty bag", async () => {
    const email = uniqueEmail("empty-bag");
    const res = await placeOrder(undefined, form({ ...fields(email), items: "[]" }));
    expect(res).toEqual({ ok: false, error: "Your bag is empty." });
  });

  it("rejects an unavailable line", async () => {
    const email = uniqueEmail("unavailable");
    const res = await placeOrder(
      undefined,
      form({ ...fields(email), items: JSON.stringify([cartLine({ slug: "ghost" })]) }),
    );
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.error).toMatch(/no longer available/i);
  });

  it("places a valid order with a source-priced total and a well-formed number", async () => {
    const email = uniqueEmail("valid");
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

  it("expands a pair line into two linked OrderItems and records the discount", async () => {
    const email = uniqueEmail("pair");
    const pairLine = cartLine({
      priceCents: PAIR_PRICE_CENTS,
      qty: 1,
      pair: { productId: "test-fixture-trouser", slug: TROUSER_SLUG, name: "Ivory Wide-Leg", image: null },
    });
    const res = await placeOrder(
      undefined,
      form({ ...fields(email), items: JSON.stringify([pairLine]) }),
    );
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;

    expect(res.totalCents).toBe(PAIR_PRICE_CENTS + SHIPPING_CENTS);

    const order = await prisma.order.findUniqueOrThrow({
      where: { orderNumber: res.orderNumber },
      include: { items: true },
    });
    expect(order.discountCents).toBe(SHIRT_PRICE_CENTS + TROUSER_PRICE_CENTS - PAIR_PRICE_CENTS);
    expect(order.items).toHaveLength(2);
    const [shirtLine, trouserLine] = order.items;
    expect(shirtLine.pairGroupId).toBe(trouserLine.pairGroupId);
    expect(shirtLine.priceCents + trouserLine.priceCents).toBe(PAIR_PRICE_CENTS);
  });
});
