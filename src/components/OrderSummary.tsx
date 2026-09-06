"use client";

import type { CartItem } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import CartLineItem from "@/components/CartLineItem";
import SiteButton from "@/components/SiteButton";

export default function OrderSummary({
  items,
  subtotalCents,
  pending,
  disabled,
  note,
}: {
  items: CartItem[];
  subtotalCents: number;
  pending: boolean;
  disabled: boolean;
  note?: string;
}) {
  return (
    <aside className="rounded-[18px] bg-surface p-5 shadow-lg shadow-background-deep/15 sm:p-6 lg:sticky lg:top-28">
      <h2 className="text-sm font-bold text-foreground">Order summary</h2>

      <div className="mt-3 divide-y divide-foreground/10">
        {items.map((item) => (
          <CartLineItem
            key={`${item.productId}-${item.size}`}
            item={item}
            variant="compact"
          />
        ))}
      </div>

      <dl className="mt-4 space-y-1.5 border-t-2 border-dashed border-foreground/15 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-foreground/70">Subtotal</dt>
          <dd className="tabular-nums text-foreground">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground/70">Shipping</dt>
          <dd className="text-foreground/70">Confirmed at delivery</dd>
        </div>
        <div className="flex justify-between pt-1.5 text-base font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
        </div>
      </dl>

      {note && (
        <p className="mt-3 rounded-[12px] bg-surface-warm px-3 py-2 text-xs font-semibold text-danger">
          {note}
        </p>
      )}

      <div className="mt-5">
        <SiteButton
          label="Place order"
          type="submit"
          magnetic={false}
          disabled={pending || disabled}
          arrow={false}
          className="w-full"
        >
          {pending ? "Placing…" : `Place order · ${formatPrice(subtotalCents)}`}
        </SiteButton>
      </div>
      <p className="mt-3 text-center font-script text-base text-foreground/60">
        no payment now · pay cash on delivery
      </p>
    </aside>
  );
}
