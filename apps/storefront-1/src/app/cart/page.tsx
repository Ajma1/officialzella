"use client";

import { useCart } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import { SHIPPING_CENTS, orderTotalCents } from "@/lib/checkout/shipping";
import PageHeading from "@/components/PageHeading";
import CartLineItem from "@/components/CartLineItem";
import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";
import { HeartIcon } from "@/components/icons";

export default function CartPage() {
  const { items, count, subtotalCents } = useCart();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:pt-16">
      <PageHeading>{count > 0 ? `Your bag · ${count}` : "Your bag"}</PageHeading>

      {items.length === 0 ? (
        <EmptyState
          sticker={<HeartIcon size={40} className="text-cherry" />}
          heading="Your bag's feeling light"
          note="let's fix that"
          action={
            <SiteButton href="/shirts" label="Shop">
              Shop the edit
            </SiteButton>
          }
          showCategories
        />
      ) : (
        <div className="mt-10">
          <div className="divide-y divide-foreground/10 border-y-2 border-dashed border-foreground/15">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.size}`} item={item} />
            ))}
          </div>

          <div className="mt-8 rounded-[18px] bg-surface p-6 shadow-lg shadow-background-deep/15">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground/70">Subtotal</dt>
                <dd className="tabular-nums text-foreground">{formatPrice(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/70">Delivery</dt>
                <dd className="tabular-nums text-foreground">{formatPrice(SHIPPING_CENTS)}</dd>
              </div>
              <div className="flex justify-between border-t-2 border-dashed border-foreground/15 pt-2 text-lg font-bold text-cherry">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(orderTotalCents(subtotalCents))}</dd>
              </div>
            </dl>
            <p className="mt-2 text-sm text-foreground/60">pay cash on delivery</p>
            <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
              <SiteButton href="/checkout" label="Checkout" className="w-full sm:w-auto">
                Checkout
              </SiteButton>
              <SiteButton href="/shirts" label="Shop" variant="secondary" arrow={false}>
                keep shopping
              </SiteButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
