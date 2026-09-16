"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@zella/db";
import { OrderStatus } from "@zella/db";

const STATUSES = Object.values(OrderStatus);

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as OrderStatus)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
