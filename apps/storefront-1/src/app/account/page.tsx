import { redirect } from "next/navigation";
import { prisma } from "@zella/db";
import { getSessionCustomer } from "@zella/core/customer";
import { cancelOrder, signOutAndRedirect } from "@zella/core/actions";
import { formatPrice } from "@zella/core/format";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";
import { BagIcon } from "@/components/icons";

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
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading accent="orders.">Your orders.</PageHeading>
        <form action={signOutAndRedirect}>
          <button
            type="submit"
            className="rounded-full border-2 border-dashed border-foreground/40 px-4 py-2 font-script text-base text-foreground/70 transition-colors hover:border-cherry hover:text-cherry"
          >
            Sign out
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          sticker={<BagIcon className="h-10 w-10 text-cherry" />}
          heading="No orders yet"
          note="once you check out, your orders will show up here"
          action={
            <SiteButton href="/" label="Shop">
              Start shopping
            </SiteButton>
          }
        />
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[18px] bg-surface p-5 shadow-lg shadow-background-deep/15 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold text-foreground">{order.orderNumber}</p>
                <span className="rounded-full bg-cherry/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-cherry">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                {order.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <div className="mt-3 divide-y divide-foreground/10 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 py-1.5">
                    <span className="text-foreground/80">
                      {item.product.name} · {item.size} × {item.quantity}
                    </span>
                    <span className="shrink-0 tabular-nums text-foreground/70">
                      {formatPrice(item.priceCents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-foreground/15 pt-3">
                <span className="text-sm font-bold text-cherry">
                  {formatPrice(order.totalCents)}
                </span>
                {order.status === "PENDING" && (
                  <form action={cancelOrder.bind(null, order.id)}>
                    <button
                      type="submit"
                      className="text-xs font-semibold text-danger underline decoration-dashed underline-offset-2 hover:opacity-80"
                    >
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
