"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, type CartItem } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import { MinusIcon, PlusIcon } from "@/components/icons";

function Thumb({ item }: { item: CartItem }) {
  return (
    <div className="relative h-20 w-16 shrink-0 -rotate-3 rounded-[10px] bg-surface p-1 shadow-md shadow-background-deep/20">
      <div className="image-outline relative h-full w-full overflow-hidden rounded-[6px] bg-surface-warm">
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <span
            className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "var(--surface-warm)" }}
          />
        )}
      </div>
      <span className="absolute -top-1.5 left-1/2 h-3 w-8 -translate-x-1/2 -rotate-3 rounded-sm bg-sunshine/90" />
    </div>
  );
}

export default function CartLineItem({
  item,
  variant = "full",
  disabled = false,
}: {
  item: CartItem;
  variant?: "full" | "compact";
  disabled?: boolean;
}) {
  const { setQty, remove } = useCart();
  const lineTotal = formatPrice(item.priceCents * item.qty);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 py-3">
        <Thumb item={item} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-xs text-foreground/60">
            {item.colorway ? `${item.colorway} · ` : ""}Size {item.size} · ×{item.qty}
          </p>
        </div>
        <p className="text-sm tabular-nums text-foreground/80">{lineTotal}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 py-4 ${disabled ? "opacity-60" : ""}`}
      aria-disabled={disabled || undefined}
    >
      <Thumb item={item} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-semibold text-foreground hover:text-cherry"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-foreground/60">
              {item.colorway ? `${item.colorway} · ` : ""}Size {item.size}
            </p>
          </div>
          <p className="shrink-0 text-sm tabular-nums text-foreground/80">{lineTotal}</p>
        </div>

        {disabled ? (
          <p className="mt-2 text-xs font-semibold text-danger">
            No longer available — remove to continue
          </p>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center rounded-full bg-surface-warm">
              <button
                type="button"
                onClick={() => setQty(item.productId, item.size, item.qty - 1)}
                disabled={item.qty <= 1}
                aria-label="Decrease quantity"
                data-cursor-label="Less"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 disabled:opacity-40 hover:text-cherry"
              >
                <MinusIcon />
              </button>
              <span className="w-7 text-center text-sm tabular-nums font-semibold">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(item.productId, item.size, item.qty + 1)}
                aria-label="Increase quantity"
                data-cursor-label="More"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 hover:text-cherry"
              >
                <PlusIcon />
              </button>
            </div>

            <button
              type="button"
              onClick={() => remove(item.productId, item.size)}
              data-cursor-label="Remove"
              className="font-script text-base text-foreground/60 transition-colors hover:text-danger"
            >
              remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
