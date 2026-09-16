"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@zella/db";
import { getSessionCustomer, destroySession } from "../customer/session";

/** Loads the order by *both* id and the session's own customerId, so a
 *  customer can never act on another customer's order by guessing an id —
 *  and re-checks status === PENDING in the same write, race-safe against an
 *  admin changing it concurrently. */
export async function cancelOrder(orderId: string) {
  const customer = await getSessionCustomer();
  if (!customer) return;

  await prisma.order.updateMany({
    where: { id: orderId, customerId: customer.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/account");
}

export async function signOutAndRedirect(): Promise<void> {
  await destroySession();
  redirect("/");
}
