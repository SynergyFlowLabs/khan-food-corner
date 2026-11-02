"use client";

import Link from "next/link";
import { useState } from "react";
import { cartActions } from "@/lib/cart-store";
import { formatPKR } from "@/lib/format";
import { playCartSound } from "@/lib/cart-sound";
import { categoryLabel } from "@/lib/shop";
import type { Product } from "@/lib/types";
import { Img, SpiceMeter, Stars } from "./ui";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [added, setAdded] = useState(false);
  const hasVariants = product.variants.length > 0;
  const fromPrice = hasVariants ? Math.min(...product.variants.map((v) => v.price)) : product.price;
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  function quickAdd() {
    cartActions.add(product, { openDrawer: false });
    playCartSound();
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-paper shadow-[0_1px_0_rgba(23,17,13,0.06),0_12px_30px_-18px_rgba(23,17,13,0.25)] ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(23,17,13,0.4)]">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3.4] overflow-hidden bg-sand" aria-label={product.name}>
        <Img
          src={product.images[0]}
          alt={product.name}
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {product.images[1] && (
          <Img
            src={product.images[1]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isBestseller && (
            <span className="rounded-full bg-saffron px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink">Bestseller</span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-paper">New</span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-ember px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-paper">−{discount}%</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink/45">
          <span>{categoryLabel(product.category)}</span>
          <SpiceMeter level={product.spice} />
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display mt-2 text-[1.3rem] font-semibold leading-tight tracking-tight transition-colors group-hover:text-ember">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/60">{product.tagline}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink/60">
          <Stars value={product.rating} size={13} />
          <span className="font-semibold text-ink/80">{product.rating ? product.rating.toFixed(1) : "New"}</span>
          {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {hasVariants && <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-ink/45">From</span>}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight">{formatPKR(fromPrice)}</span>
              {product.comparePrice && <span className="text-sm text-ink/40 line-through">{formatPKR(product.comparePrice)}</span>}
            </div>
          </div>
          {hasVariants ? (
            <Link
              href={`/product/${product.slug}`}
              className="rounded-full border border-ink/20 px-4 py-2.5 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-paper"
            >
              Choose
            </Link>
          ) : (
            <button
              onClick={quickAdd}
              className={`flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold transition active:scale-95 ${
                added ? "bg-emerald-600 text-paper" : "bg-ink text-paper hover:bg-ember"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">+</span> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
