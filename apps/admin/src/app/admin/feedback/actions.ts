"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@zella/db";
import { FeedbackStatus } from "@zella/db";

const STATUSES = Object.values(FeedbackStatus);

export async function updateFeedbackStatus(id: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as FeedbackStatus)) return;

  await prisma.feedback.update({
    where: { id },
    data: { status: status as FeedbackStatus },
  });

  // Same-project only — a storefront-2 revalidatePath call from here would
  // be a no-op anyway (separate Vercel project), and storefront-2 is
  // already force-dynamic, so there's nothing to invalidate there.
  revalidatePath("/admin/feedback");
}
