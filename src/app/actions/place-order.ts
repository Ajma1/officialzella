"use server";

import { checkoutSchema } from "@/lib/checkout/schema";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { revalidateCart } from "@/app/actions/revalidate-cart";
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

  // Total is computed server-side from revalidated source prices, never the client's.
  const totalCents = revalidated.subtotalCents;
  const orderNumber = generateOrderNumber();

  // TODO(db): when Supabase/Postgres lands, replace this block with:
  //   await prisma.order.create({
  //     data: {
  //       status: "PENDING",
  //       paymentMethod: "COD",
  //       totalCents,
  //       customerName: parsed.data.fullName,
  //       customerPhone: parsed.data.phone,
  //       customerEmail: parsed.data.email || null,
  //       notes: parsed.data.notes || null,
  //       address: { create: { fullName: parsed.data.recipientName || parsed.data.fullName, phone: parsed.data.phone, line1, line2, city, state, postalCode, country } },
  //       items: { create: items.map(i => ({ productId: <resolved>, quantity: i.qty, priceCents: <source>, size: i.size })) },
  //     },
  //   });
  // The friendly code can become a real `Order.orderNumber` column, or surface a slice of the cuid.

  return {
    ok: true,
    orderNumber,
    totalCents,
    email: parsed.data.email ? parsed.data.email : null,
  };
}
