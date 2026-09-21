import { describe, it, expect, vi, beforeEach } from "vitest";

const headersMock = vi.fn();
vi.mock("next/headers", () => ({ headers: () => headersMock() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@zella/db";
import { submitFeedback } from "../feedback";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

function withIp(ip: string) {
  headersMock.mockReturnValue(
    Promise.resolve({ get: (name: string) => (name === "x-forwarded-for" ? ip : null) }),
  );
}

const validFields = (ip: string) => {
  withIp(ip);
  return {
    rating: "5",
    name: "Ava",
    email: "ava@example.com",
    orderNumber: "ZELLA-ABCDE",
    message: "Loved the fit, will buy again for sure.",
  };
};

describe("submitFeedback", () => {
  it("creates a PENDING feedback row on a valid submission", async () => {
    const res = await submitFeedback(undefined, form(validFields("1.1.1.1")));
    expect(res?.ok).toBe(true);
    const row = await prisma.feedback.findFirst({
      where: { orderNumber: "ZELLA-ABCDE" },
      orderBy: { createdAt: "desc" },
    });
    expect(row?.status).toBe("PENDING");
    expect(row?.rating).toBe(5);
    expect(row?.message).toBe("Loved the fit, will buy again for sure.");
  });

  it("stores email/name/orderNumber as null when omitted", async () => {
    withIp("1.1.1.2");
    const res = await submitFeedback(
      undefined,
      form({ rating: "4", message: "Nice fabric, true to size for once." }),
    );
    expect(res?.ok).toBe(true);
    const row = await prisma.feedback.findFirst({
      where: { message: "Nice fabric, true to size for once." },
    });
    expect(row?.name).toBeNull();
    expect(row?.email).toBeNull();
    expect(row?.orderNumber).toBeNull();
  });

  it("rejects a rating outside 1-5 with a field error", async () => {
    withIp("1.1.1.3");
    const res = await submitFeedback(
      undefined,
      form({ rating: "9", message: "This message is long enough to pass." }),
    );
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.rating).toBeTruthy();
  });

  it("rejects a message under 10 characters with a field error", async () => {
    withIp("1.1.1.4");
    const res = await submitFeedback(undefined, form({ rating: "3", message: "too short" }));
    expect(res?.ok).toBe(false);
    expect(res && !res.ok && res.fieldErrors?.message).toBeTruthy();
  });

  it("silently absorbs a honeypot trip — same generic response as success, no row created", async () => {
    withIp("1.1.1.5");
    const before = await prisma.feedback.count();
    const res = await submitFeedback(
      undefined,
      form({
        rating: "5",
        message: "This is a totally normal bot message here.",
        companyWebsite: "http://spam.example",
      }),
    );
    expect(res).toEqual({ ok: true });
    const after = await prisma.feedback.count();
    expect(after).toBe(before);
  });

  it("silently absorbs a second submission from the same IP within the cooldown", async () => {
    const ip = "1.1.1.6";
    withIp(ip);
    const first = await submitFeedback(
      undefined,
      form({ rating: "5", message: "First submission from this IP address." }),
    );
    expect(first?.ok).toBe(true);

    withIp(ip);
    const before = await prisma.feedback.count();
    const second = await submitFeedback(
      undefined,
      form({ rating: "1", message: "Second submission, same IP, too soon." }),
    );
    expect(second).toEqual({ ok: true });
    const after = await prisma.feedback.count();
    expect(after).toBe(before); // no new row — absorbed, not rejected with an error
  });
});
