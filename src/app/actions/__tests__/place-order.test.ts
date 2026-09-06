import { describe, it, expect } from "vitest";
import { placeOrder } from "@/app/actions/place-order";
import { SHIPPING_CENTS } from "@/lib/checkout/shipping";
import { SEED_PRODUCTS } from "@/data/catalog.seed";
import type { CartItem } from "@/lib/cart/store";

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

const validFields = {
  fullName: "Ava Lin",
  phone: "+1 202 555 0142",
  email: "ava@example.com",
  line1: "12 Cotton Lane",
  city: "Portland",
  country: "Pakistan",
};

describe("placeOrder", () => {
  it("returns field errors for an invalid form", async () => {
    const res = await placeOrder(undefined, form({ ...validFields, fullName: "" }));
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.fullName).toBeTruthy();
  });

  it("rejects an empty bag", async () => {
    const res = await placeOrder(undefined, form({ ...validFields, items: "[]" }));
    expect(res).toEqual({ ok: false, error: "Your bag is empty." });
  });

  it("rejects an unavailable line", async () => {
    const res = await placeOrder(
      undefined,
      form({ ...validFields, items: JSON.stringify([cartLine({ slug: "ghost" })]) }),
    );
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.error).toMatch(/no longer available/i);
  });

  it("places a valid order with a source-priced total and a well-formed number", async () => {
    const res = await placeOrder(
      undefined,
      form({
        ...validFields,
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
