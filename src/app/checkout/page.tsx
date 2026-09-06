"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/useCart";
import { placeOrder } from "@/app/actions/place-order";
import {
  revalidateCart,
  type RevalidateResult,
} from "@/app/actions/revalidate-cart";
import PageHeading from "@/components/PageHeading";
import CheckoutForm from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, undefined);
  const [reval, setReval] = useState<RevalidateResult | null>(null);
  const orderedRef = useRef(false);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const generalError = state && !state.ok ? state.error : undefined;

  useEffect(() => {
    const parsed: typeof items = JSON.parse(itemsJson);
    if (parsed.length === 0) return;
    let cancelled = false;
    revalidateCart(parsed).then((r) => {
      if (!cancelled) setReval(r);
    });
    return () => {
      cancelled = true;
    };
  }, [itemsJson]);

  useEffect(() => {
    if (state?.ok && !orderedRef.current) {
      orderedRef.current = true;
      try {
        sessionStorage.setItem(
          "zella-last-order",
          JSON.stringify({
            orderNumber: state.orderNumber,
            totalCents: state.totalCents,
            email: state.email,
            items: JSON.parse(itemsJson),
          }),
        );
      } catch {
        /* private mode — confirmation shows the fallback */
      }
      clear();
      router.push("/checkout/confirmation");
    }
  }, [state, itemsJson, clear, router]);

  // The cart hydrates from localStorage a tick after mount, so wait before
  // treating an empty cart as "nothing to check out".
  useEffect(() => {
    if (orderedRef.current || items.length > 0) return;
    const t = window.setTimeout(() => {
      if (!orderedRef.current) router.replace("/cart");
    }, 250);
    return () => window.clearTimeout(t);
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <main className="px-6 py-24 text-center">
        <p className="font-script text-xl text-foreground/60">loading your bag…</p>
      </main>
    );
  }

  const unavailable = reval?.lines.filter((l) => l.unavailable).length ?? 0;
  const summaryNote =
    generalError ??
    (unavailable > 0
      ? "An item in your bag is no longer available — review your bag."
      : undefined);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-10 lg:px-16">
      <PageHeading accent=".">Checkout.</PageHeading>

      {reval?.hasCorrections && (
        <div
          role="status"
          className="mt-6 rounded-[14px] border-2 border-cherry/40 bg-cherry/5 px-4 py-3 text-sm font-semibold text-foreground"
        >
          Some items in your bag changed —{" "}
          <a href="/cart" className="text-cherry underline">
            review your bag
          </a>
          .
        </div>
      )}

      <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <input type="hidden" name="items" value={itemsJson} />
        <CheckoutForm errors={fieldErrors} />
        <OrderSummary
          items={items}
          subtotalCents={reval?.subtotalCents ?? subtotalCents}
          pending={pending}
          disabled={unavailable > 0}
          note={summaryNote}
        />
      </form>
    </main>
  );
}
