import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn().mockResolvedValue({ id: "test-admin" }) }));
vi.mock("@zella/core/email", () => ({ sendAdminOrderEmail: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@zella/db";
import { updateOrderStatus } from "../actions";
import { sendAdminOrderEmail } from "@zella/core/email";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function makeOrder(status: "PENDING" | "CANCELLED" = "PENDING") {
  return prisma.order.create({
    data: {
      orderNumber: `TST${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status,
      totalCents: 5000,
      customerName: "Test Customer",
      customerPhone: "+1 555 0100",
      customerEmail: `admin-actions-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      address: {
        create: {
          fullName: "Test Customer",
          phone: "+1 555 0100",
          line1: "1 Test Street",
          city: "Testville",
          country: "Pakistan",
        },
      },
    },
  });
}

beforeEach(() => {
  vi.mocked(sendAdminOrderEmail).mockClear();
});

describe("updateOrderStatus", () => {
  it("updates the order's status", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CONFIRMED" }));
    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("CONFIRMED");
  });

  it("ignores an invalid status value", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "NOT_A_STATUS" }));
    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });

  it("notifies admin when transitioning into CANCELLED", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CANCELLED" }));
    expect(sendAdminOrderEmail).toHaveBeenCalledWith(
      "cancelled_by_admin",
      expect.objectContaining({ orderNumber: order.orderNumber }),
    );
  });

  it("does not re-notify when the order is already CANCELLED", async () => {
    const order = await makeOrder("CANCELLED");
    await updateOrderStatus(order.id, form({ status: "CANCELLED" }));
    expect(sendAdminOrderEmail).not.toHaveBeenCalled();
  });

  it("does not notify for a non-cancellation status change", async () => {
    const order = await makeOrder();
    await updateOrderStatus(order.id, form({ status: "CONFIRMED" }));
    expect(sendAdminOrderEmail).not.toHaveBeenCalled();
  });

  it("rejects when the caller is not an authenticated admin", async () => {
    const { requireAdmin } = await import("@/lib/auth");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Unauthorized"));

    const order = await makeOrder();
    await expect(updateOrderStatus(order.id, form({ status: "CONFIRMED" }))).rejects.toThrow(
      "Unauthorized",
    );

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });
});
