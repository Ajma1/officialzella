"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@zella/db";

export type InventoryState = { error?: string; saved?: boolean } | undefined;

/** Reads every `stock_<variantId>` field the inventory table submitted and
 *  writes them in one pass — the whole catalog's stock, one save. */
export async function updateInventory(
  _prevState: InventoryState,
  formData: FormData,
): Promise<InventoryState> {
  await requireAdmin();

  const updates: { id: string; stock: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const stock = Math.max(0, Math.floor(Number(value) || 0));
    updates.push({ id: key.slice("stock_".length), stock });
  }

  await Promise.all(
    updates.map((u) =>
      prisma.productVariant.update({ where: { id: u.id }, data: { stock: u.stock } }),
    ),
  );

  revalidatePath("/admin/inventory");
  return { saved: true };
}
