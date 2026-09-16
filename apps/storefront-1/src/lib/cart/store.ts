/**
 * Framework-free cart store. Holds a denormalised snapshot per line so the
 * cart UI never touches the catalog. Persists to localStorage (key
 * `zella-cart`, shape `{ v: 1, items }`), syncs across tabs via the `storage`
 * event, and falls back to in-memory when storage is unavailable (private mode).
 */
import type { Size } from "@/data/catalog.seed";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  colorway: string | null;
  image: string | null;
  size: Size;
  priceCents: number;
  qty: number;
}

const KEY = "zella-cart";
const MAX_QTY = 10;
const EMPTY: CartItem[] = [];

let memory: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function safeStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

function load(): CartItem[] {
  const ls = safeStorage();
  if (!ls) return memory;
  try {
    const raw = ls.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as { v?: number; items?: unknown };
    if (parsed?.v === 1 && Array.isArray(parsed.items)) {
      return parsed.items as CartItem[];
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureHydrated() {
  if (!hydrated) {
    memory = load();
    hydrated = true;
  }
}

function commit(items: CartItem[]) {
  memory = items;
  const ls = safeStorage();
  if (ls) {
    try {
      ls.setItem(KEY, JSON.stringify({ v: 1, items }));
    } catch {
      /* quota / private mode — in-memory only */
    }
  }
  listeners.forEach((l) => l());
}

const clampQty = (n: number) => Math.max(1, Math.min(Math.floor(n), MAX_QTY));

export function getSnapshot(): CartItem[] {
  ensureHydrated();
  return memory;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      memory = load();
      cb();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function addItem(input: Omit<CartItem, "qty">, qty = 1): void {
  ensureHydrated();
  const add = clampQty(qty);
  const existing = memory.find(
    (i) => i.productId === input.productId && i.size === input.size,
  );
  const next = existing
    ? memory.map((i) =>
        i === existing ? { ...i, qty: Math.min(i.qty + add, MAX_QTY) } : i,
      )
    : [...memory, { ...input, qty: add }];
  commit(next);
}

export function setItemQty(productId: string, size: Size, qty: number): void {
  ensureHydrated();
  const clamped = clampQty(qty);
  commit(
    memory.map((i) =>
      i.productId === productId && i.size === size ? { ...i, qty: clamped } : i,
    ),
  );
}

export function removeItem(productId: string, size: Size): void {
  ensureHydrated();
  commit(memory.filter((i) => !(i.productId === productId && i.size === size)));
}

export function clearCart(): void {
  commit(EMPTY);
}

export function getCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function getSubtotalCents(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.priceCents * i.qty, 0);
}

/** Test-only: wipe module state so each test starts clean. */
export function __resetCartForTests(): void {
  memory = EMPTY;
  hydrated = false;
  listeners.clear();
}
