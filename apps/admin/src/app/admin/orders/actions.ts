"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@zella/db";
import { OrderStatus } from "@zella/db";
import { sendAdminOrderEmail } from "@zella/core/email";

const STATUSES = Object.values(OrderStatus);

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as OrderStatus)) return;

  // Guard is part of the atomic write itself (status: { not: ... }), not a
  // separate read-then-write — two concurrent requests can't both pass a
  // stale check and both fire a notification.
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: { not: status as OrderStatus } },
    data: { status: status as OrderStatus },
  });

  if (result.count > 0 && status === "CANCELLED") {
    const updated = await prisma.order.findUnique({ where: { id: orderId } });
    if (updated) {
      try {
        await sendAdminOrderEmail("cancelled_by_admin", {
          orderNumber: updated.orderNumber,
          customerName: updated.customerName,
          totalCents: updated.totalCents,
        });
      } catch (e) {
        console.error(
          `[email] failed to send "cancelled_by_admin" notification for ${updated.orderNumber}`,
          e,
        );
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
