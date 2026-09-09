"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/useCart";
import { useCartUi } from "@/lib/cart/cart-ui";
import { formatPrice } from "@/lib/format";
import Drawer from "@/components/Drawer";
import CartLineItem from "@/components/CartLineItem";
import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";
import { CloseIcon, HeartIcon } from "@/components/icons";

export default function CartDrawer() {
  const { isOpen, close } = useCartUi();
  const { items, count, subtotalCents } = useCart();

  return (
    <Drawer open={isOpen} onClose={close} side="right" label="Your bag">
      <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/15 px-5 py-4">
        <h2 className="font-display text-2xl text-foreground">
          Your bag{count > 0 ? ` · ${count}` : ""}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close bag"
          data-cursor-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
        >
          <CloseIcon />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center">
          <EmptyState
            sticker={<HeartIcon size={36} className="text-cherry" />}
            heading="Your bag's feeling light"
            note="nothing pinned in here yet"
            action={
              <SiteButton href="/shirts" label="Shop" onClick={close}>
                Shop the edit
              </SiteButton>
            }
          />
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-foreground/10 overflow-y-auto px-5">
            {items.map((item) => (
              <CartLineItem key={`${item.productId}-${item.size}`} item={item} />
            ))}
          </div>

          <div className="border-t-2 border-dashed border-foreground/15 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Subtotal</span>
              <span className="tabular-nums font-semibold text-foreground">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              Shipping &amp; cash-on-delivery confirmed at checkout.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <SiteButton
                href="/checkout"
                label="Checkout"
                onClick={close}
                className="w-full"
              >
                Checkout
              </SiteButton>
              <Link
                href="/cart"
                onClick={close}
                data-cursor-label="View"
                className="text-center font-script text-lg text-foreground/70 transition-colors hover:text-cherry"
              >
                view bag
              </Link>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
