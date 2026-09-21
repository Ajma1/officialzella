import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@zella/db";
import { getApprovedFeedback } from "../feedback";

const TEST_MESSAGES = ["Approved and old.", "Approved and new.", "Still pending.", "Got rejected."];

afterAll(async () => {
  await prisma.feedback.deleteMany({ where: { message: { in: TEST_MESSAGES } } });
});

describe("getApprovedFeedback", () => {
  it("returns only APPROVED feedback, newest first, never the email field", async () => {
    await prisma.feedback.create({
      data: { rating: 5, message: "Approved and old.", status: "APPROVED", email: "old@example.com" },
    });
    await new Promise((r) => setTimeout(r, 5));
    const newest = await prisma.feedback.create({
      data: { rating: 4, message: "Approved and new.", status: "APPROVED", email: "new@example.com" },
    });
    await prisma.feedback.create({ data: { rating: 3, message: "Still pending.", status: "PENDING" } });
    await prisma.feedback.create({ data: { rating: 1, message: "Got rejected.", status: "REJECTED" } });

    const results = await getApprovedFeedback();
    const messages = results.map((r) => r.message);

    expect(messages).toContain("Approved and old.");
    expect(messages).toContain("Approved and new.");
    expect(messages).not.toContain("Still pending.");
    expect(messages).not.toContain("Got rejected.");
    expect(results[0].id).toBe(newest.id); // newest first
    expect(results[0]).not.toHaveProperty("email");
  });

  it("respects an optional limit", async () => {
    const results = await getApprovedFeedback(1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});
