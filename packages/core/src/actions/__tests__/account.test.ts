import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => import("../../test/cookie-jar"));
vi.mock("../../email", () => ({ sendLoginPin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@zella/db";
import { requestPin, verifyPin } from "../customer-auth";
import { cancelOrder } from "../account";
import { sendLoginPin } from "../../email";
import { __resetCookieJar } from "../../test/cookie-jar";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const uniqueEmail = (tag: string) =>
  `account-${tag}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

async function signInAs(email: string) {
  await requestPin(undefined, form({ email }));
  const calls = vi.mocked(sendLoginPin).mock.calls;
  const pin = calls[calls.length - 1][1];
  const res = await verifyPin(undefined, form({ email, code: pin }));
  if (!res?.ok) throw new Error("test setup: pin verification failed");
}

async function makeOrder(customerId: string, email: string, status: "PENDING" | "CANCELLED" = "PENDING") {
  return prisma.order.create({
    data: {
      orderNumber: `TST${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status,
      totalCents: 5000,
      customerName: "Test Customer",
      customerPhone: "+1 555 0100",
      customerEmail: email,
      customer: { connect: { id: customerId } },
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
  __resetCookieJar();
  vi.mocked(sendLoginPin).mockClear();
});

describe("cancelOrder", () => {
  it("cancels the signed-in customer's own pending order", async () => {
    const email = uniqueEmail("owner");
    await signInAs(email);
    const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
    const order = await makeOrder(customer.id, email);

    await cancelOrder(order.id);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("CANCELLED");
  });

  it("does not let a customer cancel another customer's order", async () => {
    const emailA = uniqueEmail("victim");
    const emailB = uniqueEmail("attacker");
    await signInAs(emailA);
    const customerA = await prisma.customer.findUniqueOrThrow({ where: { email: emailA } });
    const order = await makeOrder(customerA.id, emailA);

    // Switch the (mocked) browser session to a different customer.
    await signInAs(emailB);

    await cancelOrder(order.id);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });

  it("does nothing when there is no session", async () => {
    const email = uniqueEmail("noauth");
    await signInAs(email);
    const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
    const order = await makeOrder(customer.id, email);

    __resetCookieJar(); // signed out

    await cancelOrder(order.id);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("PENDING");
  });

  it("does not resurrect an already-cancelled order", async () => {
    const email = uniqueEmail("already-cancelled");
    await signInAs(email);
    const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
    const order = await makeOrder(customer.id, email, "CANCELLED");

    await cancelOrder(order.id);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("CANCELLED");
  });
});
