"use server";

import { checkoutSchema } from "@/lib/checkout/schema";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { orderTotalCents } from "@/lib/checkout/shipping";
import { revalidateCart } from "@/app/actions/revalidate-cart";
import { getProductBySlug } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type { CartItem } from "@/lib/cart/store";

export type PlaceOrderState =
  | { ok: true; orderNumber: string; totalCents: number; email: string | null }
  | { ok: false; fieldErrors?: Record<string, string>; error?: string }
  | undefined;

export async function placeOrder(
  _prev: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  const raw = {
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    line1: formData.get("line1") ?? "",
    line2: formData.get("line2") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    country: formData.get("country") ?? "",
    notes: formData.get("notes") ?? "",
    shipToDifferent: formData.get("shipToDifferent") === "on",
    recipientName: formData.get("recipientName") ?? "",
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  let items: CartItem[] = [];
  try {
    const decoded = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(decoded)) items = decoded;
  } catch {
    /* fall through to empty-bag guard */
  }
  if (items.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  const revalidated = await revalidateCart(items);
  if (revalidated.lines.some((l) => l.unavailable)) {
    return {
      ok: false,
      error: "Something in your bag is no longer available — please review it.",
    };
  }

  // Total is computed server-side: revalidated source prices + flat delivery,
  // never the client's numbers.
  const totalCents = orderTotalCents(revalidated.subtotalCents);

  // Resolve each line to its DB-source product + price (never the client's).
  const resolvedItems = await Promise.all(
    items.map(async (item) => {
      const product = await getProductBySlug(item.slug);
      if (!product) throw new Error(`Product vanished mid-order: ${item.slug}`);
      return {
        productId: product.id,
        size: item.size,
        quantity: item.qty,
        priceCents: product.priceCents,
      };
    }),
  );

  const address = {
    fullName: parsed.data.recipientName || parsed.data.fullName,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    state: parsed.data.state || null,
    postalCode: parsed.data.postalCode || null,
    country: parsed.data.country,
  };

  // Order numbers are random 5-char codes (32^5 space) — collisions are rare
  // but the unique constraint can still hit one; a couple of retries absorbs it.
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      await prisma.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          paymentMethod: "COD",
          totalCents,
          customerName: parsed.data.fullName,
          customerPhone: parsed.data.phone,
          customerEmail: parsed.data.email || null,
          notes: parsed.data.notes || null,
          address: { create: address },
          items: { create: resolvedItems },
        },
      });

      return {
        ok: true,
        orderNumber,
        totalCents,
        email: parsed.data.email ? parsed.data.email : null,
      };
    } catch (e) {
      const isOrderNumberClash =
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        (e.meta?.target as string[] | undefined)?.includes("orderNumber");
      if (!isOrderNumberClash) throw e;
    }
  }

  return { ok: false, error: "Could not place your order — please try again." };
}
