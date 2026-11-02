"use client";

import { useSyncExternalStore } from "react";
import type { CartItem, Product } from "./types";

type State = { items: CartItem[]; open: boolean };

const STORAGE_KEY = "khan-food-corner:cart:v1";
const EMPTY: State = { items: [], open: false };

let state: State | null = null;
const listeners = new Set<() => void>();

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        i && typeof i.key === "string" && typeof i.productId === "number" && typeof i.price === "number" && i.qty > 0,
    );
  } catch {
    return [];
  }
}

function get(): State {
  if (!state) state = { items: load(), open: false };
  return state;
}

function set(next: Partial<State>, persist = false) {
  state = { ...get(), ...next };
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) set({ items: load() });
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  const s = useSyncExternalStore(subscribe, get, () => EMPTY);
  const count = s.items.reduce((n, i) => n + i.qty, 0);
  const subtotal = s.items.reduce((n, i) => n + i.qty * i.price, 0);
  return { items: s.items, open: s.open, count, subtotal };
}

export const cartActions = {
  add(product: Product, opts: { variant?: string | null; qty?: number; openDrawer?: boolean } = {}) {
    const variantName = opts.variant ?? null;
    const variant = variantName ? product.variants.find((v) => v.name === variantName) : undefined;
    const price = variant?.price ?? product.price;
    const key = `${product.id}:${variant?.name ?? ""}`;
    const qty = Math.max(1, opts.qty ?? 1);
    const items = [...get().items];
    const idx = items.findIndex((i) => i.key === key);
    if (idx >= 0) items[idx] = { ...items[idx], qty: Math.min(20, items[idx].qty + qty), price };
    else
      items.push({
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variant: variant?.name ?? null,
        price,
        image: product.images[0],
        qty: Math.min(20, qty),
      });
    set({ items, open: opts.openDrawer ?? true }, true);
  },
  setQty(key: string, qty: number) {
    const items = get()
      .items.map((i) => (i.key === key ? { ...i, qty: Math.min(20, qty) } : i))
      .filter((i) => i.qty > 0);
    set({ items }, true);
  },
  remove(key: string) {
    set({ items: get().items.filter((i) => i.key !== key) }, true);
  },
  clear() {
    set({ items: [] }, true);
  },
  openDrawer() {
    set({ open: true });
  },
  closeDrawer() {
    set({ open: false });
  },
};
