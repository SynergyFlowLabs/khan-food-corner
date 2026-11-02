"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "@/components/CartDrawer";
import { cartActions } from "@/lib/cart-store";
import { formatPKR } from "@/lib/format";
import { playCartSound } from "@/lib/cart-sound";
import type { Product } from "@/lib/types";

export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const hasVariants = product.variants.length > 0;
  const [variant, setVariant] = useState<string | null>(hasVariants ? product.variants[0].name : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const unit = hasVariants ? (product.variants.find((v) => v.name === variant)?.price ?? product.price) : product.price;
  const compare = !hasVariants && product.comparePrice ? product.comparePrice : null;

  function add() {
    cartActions.add(product, { variant, qty, openDrawer: false });
    playCartSound();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function buyNow() {
    cartActions.add(product, { variant, qty, openDrawer: false });
    router.push("/checkout");
  }

  return (
    <div className="mt-7">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-5xl font-semibold tracking-tight">{formatPKR(unit * qty)}</span>
        {compare && (
          <>
            <span className="text-lg text-ink/40 line-through">{formatPKR(compare * qty)}</span>
            <span className="rounded-full bg-ember/10 px-2.5 py-1 text-xs font-extrabold text-ember">
              Save {formatPKR((compare - unit) * qty)}
            </span>
          </>
        )}
      </div>
      {qty > 1 && <p className="mt-1 text-sm text-ink/50">{formatPKR(unit)} each</p>}

      {hasVariants && (
        <fieldset className="mt-6">
          <legend className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/50">Choose size</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.variants.map((v) => {
              const on = v.name === variant;
              return (
                <label
                  key={v.name}
                  className={`cursor-pointer rounded-2xl border-2 px-5 py-3 transition ${
                    on ? "border-ember bg-ember/5" : "border-ink/10 bg-paper hover:border-ink/30"
                  }`}
                >
                  <input type="radio" name="variant" className="sr-only" checked={on} onChange={() => setVariant(v.name)} />
                  <span className="block text-sm font-bold">{v.name}</span>
                  <span className="block text-sm text-ink/60">{formatPKR(v.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Stepper value={qty} min={1} onChange={setQty} size="lg" />
        <button
          onClick={add}
          className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-8 text-base font-bold text-paper transition active:scale-[0.98] sm:flex-none sm:min-w-[14rem] ${
            added ? "bg-emerald-600" : "bg-ember shadow-lg shadow-ember/25 hover:bg-ember-dark"
          }`}
        >
          {added ? "✓ Added to cart" : `Add to cart · ${formatPKR(unit * qty)}`}
        </button>
      </div>
      <button
        onClick={buyNow}
        className="mt-3 h-14 w-full rounded-full border-2 border-ink text-base font-bold transition hover:bg-ink hover:text-paper"
      >
        Buy it now
      </button>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink/55">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Cooked fresh to order · Cash on delivery available
      </p>
    </div>
  );
}
