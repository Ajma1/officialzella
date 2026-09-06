"use client";

import { useSyncExternalStore } from "react";
import * as store from "@/lib/cart/store";
import type { CartItem } from "@/lib/cart/store";

export type { CartItem };

/**
 * The cart hook. The store is a module singleton, so no provider is needed —
 * any client component can call this and stays in sync (including across tabs).
 */
export function useCart() {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return {
    items,
    add: store.addItem,
    setQty: store.setItemQty,
    remove: store.removeItem,
    clear: store.clearCart,
    count: store.getCount(items),
    subtotalCents: store.getSubtotalCents(items),
  };
}
