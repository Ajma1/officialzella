import { prisma } from "@zella/db";

/**
 * The test suite has no separate test database — it writes real rows to
 * the same DATABASE_URL as production. Every fixture in this suite
 * deliberately uses an `@example.com` email (RFC 2606's reserved test
 * domain) so this teardown can find and remove exactly what the tests
 * created, and nothing else, after every run. Vitest's globalSetup
 * contract: the returned function runs once as teardown after all tests.
 */
export default async function setup() {
  return async function teardown() {
    const testOrders = await prisma.order.findMany({
      where: { customerEmail: { endsWith: "@example.com" } },
      select: { id: true, addressId: true },
    });
    await prisma.order.deleteMany({ where: { id: { in: testOrders.map((o) => o.id) } } });
    await prisma.address.deleteMany({ where: { id: { in: testOrders.map((o) => o.addressId) } } });
    await prisma.customer.deleteMany({ where: { email: { endsWith: "@example.com" } } });

    await prisma.$disconnect();
  };
}
