"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";
import CartLineItem from "@/components/CartLineItem";
import HeartConfetti from "@/components/HeartConfetti";
import { HeartIcon } from "@/components/icons";

interface LastOrder {
  orderNumber: string;
  totalCents: number;
  email: string | null;
  items: CartItem[];
}

const STEPS = [
  "We'll call to confirm your order.",
  "Your courier brings it in 2–5 days.", // PLACEHOLDER window — PLACEHOLDER_DATA.md
  "Pay cash when it arrives.",
];

export default function ConfirmationPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read the one-shot handoff written by /checkout. Browser-only, so it must
    // happen after mount.
    let parsed: LastOrder | null = null;
    try {
      const raw = sessionStorage.getItem("zella-last-order");
      if (raw) parsed = JSON.parse(raw) as LastOrder;
    } catch {
      /* private mode — falls through to the empty state */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(parsed);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!order) {
    return (
      <main className="px-6 py-16">
        <EmptyState
          sticker={<HeartIcon size={40} className="text-cherry" />}
          heading="Nothing to show here"
          note="your order confirmation has already been and gone"
          action={
            <SiteButton href="/" label="Home">
              Back to the edit
            </SiteButton>
          }
        />
      </main>
    );
  }

  const copy = () => {
    navigator.clipboard?.writeText(order.orderNumber).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="relative mx-auto max-w-2xl px-6 pb-24 pt-16 text-center">
      <HeartConfetti />
      <PageHeading accent="in." className="mx-auto">
        You&rsquo;re in.
      </PageHeading>
      <p className="mt-3 font-script text-xl text-foreground/70">
        thank you — your order&rsquo;s on its way to being made
      </p>

      <div className="mt-8 rounded-[18px] bg-surface p-6 shadow-lg shadow-background-deep/15">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
          Order number
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {order.orderNumber}
        </p>
        <button
          type="button"
          onClick={copy}
          data-cursor-label="Copy"
          className="mt-2 font-script text-base text-foreground/60 underline decoration-dashed underline-offset-4 hover:text-cherry"
        >
          {copied ? "copied ♥" : "copy"}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Order number copied" : ""}
        </span>
      </div>

      <ol className="mx-auto mt-8 max-w-md space-y-2 text-left">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-foreground/80">
            <span className="font-bold text-cherry">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-[18px] bg-surface p-5 text-left shadow-lg shadow-background-deep/15">
        <div className="divide-y divide-foreground/10">
          {order.items.map((item) => (
            <CartLineItem
              key={`${item.productId}-${item.size}`}
              item={item}
              variant="compact"
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t-2 border-dashed border-foreground/15 pt-3 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-foreground/60">
        {order.email
          ? `Keep your order number handy — a receipt to ${order.email} will follow once email is set up.`
          : "Keep your order number handy."}
      </p>

      <div className="mt-8">
        <SiteButton href="/" label="Home">
          Continue shopping
        </SiteButton>
      </div>
    </main>
  );
}
