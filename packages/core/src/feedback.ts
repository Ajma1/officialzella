import { prisma } from "@zella/db";

export interface ApprovedFeedback {
  id: string;
  rating: number;
  name: string | null;
  orderNumber: string | null;
  message: string;
  createdAt: Date;
}

/** Approved feedback only, newest first — the public read path for
 *  /feedback and the homepage testimonial strip. Deliberately selects
 *  only the fields safe to render publicly: `email` is never included,
 *  matching the spec's "admin-only, never rendered" rule at the query
 *  level, not just by convention at the call site. */
export async function getApprovedFeedback(limit?: number): Promise<ApprovedFeedback[]> {
  return prisma.feedback.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      rating: true,
      name: true,
      orderNumber: true,
      message: true,
      createdAt: true,
    },
  });
}
