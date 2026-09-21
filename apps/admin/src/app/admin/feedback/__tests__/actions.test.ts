import { describe, it, expect, vi, afterAll } from "vitest";

vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ id: "test-admin" }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@zella/db";
import { updateFeedbackStatus } from "../actions";

afterAll(async () => {
  await prisma.feedback.deleteMany({ where: { message: "A pending piece of feedback to moderate." } });
});

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function makeFeedback() {
  return prisma.feedback.create({
    data: { rating: 4, message: "A pending piece of feedback to moderate." },
  });
}

describe("updateFeedbackStatus", () => {
  it("approves a pending feedback row", async () => {
    const f = await makeFeedback();
    await updateFeedbackStatus(f.id, form({ status: "APPROVED" }));
    const updated = await prisma.feedback.findUniqueOrThrow({ where: { id: f.id } });
    expect(updated.status).toBe("APPROVED");
  });

  it("rejects a pending feedback row", async () => {
    const f = await makeFeedback();
    await updateFeedbackStatus(f.id, form({ status: "REJECTED" }));
    const updated = await prisma.feedback.findUniqueOrThrow({ where: { id: f.id } });
    expect(updated.status).toBe("REJECTED");
  });

  it("ignores an invalid status value", async () => {
    const f = await makeFeedback();
    await updateFeedbackStatus(f.id, form({ status: "NOT_A_STATUS" }));
    const unchanged = await prisma.feedback.findUniqueOrThrow({ where: { id: f.id } });
    expect(unchanged.status).toBe("PENDING");
  });

  it("rejects when the caller is not an authenticated admin", async () => {
    const { requireAdmin } = await import("@/lib/auth");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Unauthorized"));

    const f = await makeFeedback();
    await expect(updateFeedbackStatus(f.id, form({ status: "APPROVED" }))).rejects.toThrow(
      "Unauthorized",
    );
    const unchanged = await prisma.feedback.findUniqueOrThrow({ where: { id: f.id } });
    expect(unchanged.status).toBe("PENDING");
  });
});
