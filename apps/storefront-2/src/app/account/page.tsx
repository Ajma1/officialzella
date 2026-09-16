import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@zella/db";
import { getSessionCustomer } from "@zella/core/customer";
import { cancelOrder, signOutAndRedirect } from "@zella/core/actions";
import { formatPrice } from "@zella/core/format";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AccountPage() {
  const customer = await getSessionCustomer();
  if (!customer) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container-narrow" style={{ padding: "50px 28px 76px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 30px" }}>Your orders.</h1>
        <form action={signOutAndRedirect}>
          <button type="submit" className="btn btn-ghost">
            Sign out
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 44, textAlign: "center" }}>
          <p style={{ margin: "0 0 20px", fontSize: 15, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
            No orders yet.
          </p>
          <Link href="/" className="btn btn-primary" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 24 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 19 }}>{order.orderNumber}</p>
                <span className="tag tag-outline">{STATUS_LABEL[order.status] ?? order.status}</span>
              </div>
              <p style={{ margin: "4px 0 14px", fontSize: 12, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
                {order.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>

              <div>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderTop: "1px solid var(--color-divider)" }}>
                    <span>
                      {item.product.name} · {item.size} × {item.quantity}
                    </span>
                    <span style={{ fontFeatureSettings: "'tnum'" }}>{formatPrice(item.priceCents * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-divider)" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-accent-700)" }}>{formatPrice(order.totalCents)}</span>
                {order.status === "PENDING" && (
                  <form action={cancelOrder.bind(null, order.id)}>
                    <button type="submit" style={{ background: "none", border: 0, padding: 0, display: "flex", alignItems: "center", minHeight: 44, cursor: "pointer", fontSize: 12, textDecoration: "underline", color: "var(--color-accent-800)" }}>
                      Cancel order
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
