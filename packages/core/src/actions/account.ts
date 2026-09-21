"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@zella/db";
import { getSessionCustomer, destroySession } from "../customer/session";
import { sendAdminOrderEmail } from "../email";

/** Loads the order by *both* id and the session's own customerId, so a
 *  customer can never act on another customer's order by guessing an id —
 *  and re-checks status === PENDING in the same write, race-safe against an
 *  admin changing it concurrently. */
export async function cancelOrder(orderId: string) {
  const customer = await getSessionCustomer();
  if (!customer) return;

  const result = await prisma.order.updateMany({
    where: { id: orderId, customerId: customer.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  if (result.count > 0) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      try {
        await sendAdminOrderEmail("cancelled_by_customer", {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalCents: order.totalCents,
        });
      } catch (e) {
        console.error(
          `[email] failed to send "cancelled_by_customer" notification for ${order.orderNumber}`,
          e,
        );
      }
    }
  }

  revalidatePath("/account");
}

export async function signOutAndRedirect(): Promise<void> {
  await destroySession();
  redirect("/");
}
