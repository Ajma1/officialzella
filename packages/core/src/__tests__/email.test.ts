import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendAdminOrderEmail } from "../email";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockRejectedValue(new Error("Resend down")) },
  })),
}));

const order = { orderNumber: "ZELLA-ABCDE", customerName: "Ava Lin", totalCents: 500000 };

beforeEach(() => {
  vi.stubEnv("ADMIN_NOTIFY_EMAIL", "");
  vi.stubEnv("RESEND_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendAdminOrderEmail", () => {
  it("resolves without throwing when ADMIN_NOTIFY_EMAIL is unset", async () => {
    await expect(sendAdminOrderEmail("placed", order)).resolves.toBeUndefined();
  });

  it("resolves without throwing when ADMIN_NOTIFY_EMAIL is set but RESEND_API_KEY is not", async () => {
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "admin@example.com");
    await expect(sendAdminOrderEmail("cancelled_by_admin", order)).resolves.toBeUndefined();
  });

  it("resolves without throwing when Resend rejects", async () => {
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "admin@example.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_fake_key");
    await expect(sendAdminOrderEmail("cancelled_by_customer", order)).resolves.toBeUndefined();
  });
});
