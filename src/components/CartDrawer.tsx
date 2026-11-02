"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cartActions, useCart } from "@/lib/cart-store";
import { deliveryFeeFor, formatPKR } from "@/lib/format";
import { SHOP } from "@/lib/shop";
import { Img } from "./ui";

export function CartDrawer() {
  const { items, open, subtotal, count } = useCart();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cartActions.closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const remaining = Math.max(0, SHOP.freeDeliveryAbove - subtotal);
  const progress = Math.min(100, (subtotal / SHOP.freeDeliveryAbove) * 100);
  const fee = deliveryFeeFor(subtotal, SHOP.freeDeliveryAbove, SHOP.deliveryFee);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={cartActions.closeDrawer}
        className={`absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-semibold">Your order</h2>
            <p className="text-xs text-ink/55">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={cartActions.closeDrawer}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-paper"
            aria-label="Close cart"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length > 0 && (
          <div className="border-b border-ink/10 bg-cream px-6 py-4">
            <p className="text-sm">
              {remaining > 0 ? (
                <>
                  Add <b className="text-ember">{formatPKR(remaining)}</b> more for <b>free delivery</b>
                </>
              ) : (
                <b className="text-emerald-700">🎉 You&apos;ve unlocked free delivery!</b>
              )}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-ember transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-cream text-5xl">🍔</div>
              <h3 className="font-display mt-6 text-2xl font-semibold">Your cart is empty</h3>
              <p className="mt-2 max-w-[16rem] text-sm text-ink/60">Hungry? Our zingers and tikka are fired up and waiting.</p>
              <Link
                href="/shop"
                onClick={cartActions.closeDrawer}
                className="mt-6 rounded-full bg-ember px-6 py-3 text-sm font-bold text-paper transition hover:bg-ember-dark"
              >
                Browse the menu
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map((it) => (
                <li key={it.key} className="flex gap-4 py-5">
                  <Link href={`/product/${it.slug}`} onClick={cartActions.closeDrawer} className="shrink-0">
                    <Img src={it.image} alt={it.name} className="h-20 w-20 rounded-xl object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.slug}`}
                          onClick={cartActions.closeDrawer}
                          className="font-display line-clamp-2 text-[1.05rem] font-semibold leading-snug hover:text-ember"
                        >
                          {it.name}
                        </Link>
                        {it.variant && <p className="text-xs text-ink/55">{it.variant}</p>}
                      </div>
                      <button
                        onClick={() => cartActions.remove(it.key)}
                        className="text-ink/40 transition hover:text-ember"
                        aria-label={`Remove ${it.name}`}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <Stepper value={it.qty} onChange={(q) => cartActions.setQty(it.key, q)} />
                      <span className="font-semibold">{formatPKR(it.price * it.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 bg-paper px-6 pb-6 pt-5">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink/70">
                <dt>Subtotal</dt>
                <dd>{formatPKR(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink/70">
                <dt>Delivery</dt>
                <dd>{fee === 0 ? <span className="font-semibold text-emerald-700">Free</span> : formatPKR(fee)}</dd>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold">
                <dt>Total</dt>
                <dd>{formatPKR(subtotal + fee)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              onClick={cartActions.closeDrawer}
              className="mt-4 flex h-14 items-center justify-center gap-2 rounded-full bg-ember text-base font-bold text-paper shadow-lg shadow-ember/25 transition hover:bg-ember-dark active:scale-[0.98]"
            >
              Checkout · {formatPKR(subtotal + fee)}
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <button onClick={cartActions.closeDrawer} className="mt-3 w-full text-center text-sm font-semibold text-ink/60 hover:text-ink">
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  size = "sm",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "h-12 w-12 text-lg" : "h-8 w-8";
  return (
    <div className={`inline-flex items-center rounded-full border border-ink/15 ${size === "lg" ? "bg-paper" : ""}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`${dim} grid place-items-center rounded-full transition hover:bg-sand`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`text-center text-sm font-bold tabular-nums ${size === "lg" ? "w-10" : "w-7"}`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className={`${dim} grid place-items-center rounded-full transition hover:bg-sand`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
