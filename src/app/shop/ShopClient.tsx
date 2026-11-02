"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { formatPKR } from "@/lib/format";
import { CATEGORIES, SPICE_LABELS } from "@/lib/shop";
import type { Product } from "@/lib/types";

const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "popular", label: "Most popular" },
  { key: "rating", label: "Top rated" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "new", label: "Newest" },
] as const;

const minPrice = (p: Product) => (p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.price);

export function ShopClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "recommended";
  const spice = (params.get("spice") ?? "").split(",").filter(Boolean).map(Number);
  const topRated = params.get("top") === "1";
  const onSale = params.get("sale") === "1";

  const maxAvailable = useMemo(() => Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100, [products]);
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(maxAvailable);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === "all" || (k === "sort" && v === "recommended")) next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleSpice(level: number) {
    const set = new Set(spice);
    if (set.has(level)) set.delete(level);
    else set.add(level);
    setParam({ spice: [...set].sort().join(",") });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (q && !`${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q)) return false;
      if (minPrice(p) > maxPrice) return false;
      if (spice.length && !spice.includes(p.spice)) return false;
      if (topRated && p.rating < 4.5) return false;
      if (onSale && !p.comparePrice) return false;
      return true;
    });
    const by = {
      popular: (a: Product, b: Product) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount,
      rating: (a: Product, b: Product) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      "price-asc": (a: Product, b: Product) => minPrice(a) - minPrice(b),
      "price-desc": (a: Product, b: Product) => minPrice(b) - minPrice(a),
      new: (a: Product, b: Product) => Number(b.isNew) - Number(a.isNew) || b.id - a.id,
    } as Record<string, (a: Product, b: Product) => number>;
    if (by[sort]) list = [...list].sort(by[sort]);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, query, maxPrice, spice.join(","), topRated, onSale, sort]);

  const activeFilters =
    (category !== "all" ? 1 : 0) + (query ? 1 : 0) + (maxPrice < maxAvailable ? 1 : 0) + spice.length + (topRated ? 1 : 0) + (onSale ? 1 : 0);

  function clearAll() {
    setQuery("");
    setMaxPrice(maxAvailable);
    router.replace(pathname, { scroll: false });
  }

  const activeCat = CATEGORIES.find((c) => c.key === category);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [products]);

  return (
    <div>
      {/* Header */}
      <section className="grain relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/40 blur-[90px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-saffron">The menu</p>
          <h1 className="font-display rise mt-3 text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-none tracking-tight">
            {activeCat ? activeCat.label : "Everything we cook."}
          </h1>
          <p className="mt-4 max-w-xl text-paper/65">
            {activeCat ? activeCat.blurb + "." : "Zinger, burgers, fries, tikka, BBQ and more — made to order and delivered hot across Rawalpindi."}
          </p>
        </div>
      </section>

      {/* Category pills */}
      <div className="sticky top-[68px] z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {[{ key: "all", label: "All" }, ...CATEGORIES].map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setParam({ category: c.key })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  active ? "bg-ink text-paper" : "bg-paper text-ink/70 ring-1 ring-ink/10 hover:text-ember hover:ring-ember"
                }`}
              >
                {c.label}
                <span className={`ml-1.5 text-xs ${active ? "text-paper/60" : "text-ink/35"}`}>
                  {c.key === "all" ? products.length : counts.get(c.key) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10">
        {/* Filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} mb-8 lg:block`}>
          <div className="space-y-8 rounded-3xl bg-paper p-6 ring-1 ring-ink/5 lg:sticky lg:top-[152px]">
            <div>
              <label htmlFor="q" className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/50">Search</label>
              <div className="relative mt-3">
                <svg viewBox="0 0 24 24" width="16" height="16" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  id="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Zinger, tikka, fries…"
                  className="h-11 w-full rounded-full border border-ink/15 bg-cream pl-10 pr-4 text-sm outline-none transition focus:border-ember focus:bg-paper"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="price" className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/50">Max price</label>
                <span className="text-sm font-bold">{formatPKR(maxPrice)}</span>
              </div>
              <input
                id="price"
                type="range"
                min={100}
                max={maxAvailable}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="khan-range mt-4 w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-ink/40">
                <span>Rs 100</span>
                <span>{formatPKR(maxAvailable)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/50">Spice level</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SPICE_LABELS.map((l, i) => (
                  <button
                    key={l}
                    onClick={() => toggleSpice(i)}
                    aria-pressed={spice.includes(i)}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                      spice.includes(i) ? "bg-ember text-paper" : "bg-cream ring-1 ring-ink/10 hover:ring-ember"
                    }`}
                  >
                    {"🌶".repeat(i) || "○"} {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Toggle label="Rated 4.5★ & up" checked={topRated} onChange={(v) => setParam({ top: v ? "1" : null })} />
              <Toggle label="On offer" checked={onSale} onChange={(v) => setParam({ sale: v ? "1" : null })} />
            </div>

            {activeFilters > 0 && (
              <button onClick={clearAll} className="w-full rounded-full border border-ink/20 py-2.5 text-sm font-bold transition hover:bg-ink hover:text-paper">
                Clear all filters ({activeFilters})
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 text-sm font-bold lg:hidden"
                aria-expanded={filtersOpen}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filters{activeFilters > 0 && ` (${activeFilters})`}
              </button>
              <p className="text-sm text-ink/60" aria-live="polite">
                <b className="text-ink">{filtered.length}</b> {filtered.length === 1 ? "item" : "items"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden font-semibold text-ink/60 sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setParam({ sort: e.target.value })}
                className="h-11 cursor-pointer rounded-full border border-ink/15 bg-paper px-4 text-sm font-bold outline-none focus:border-ember"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-paper px-6 py-20 text-center ring-1 ring-ink/5">
              <p className="text-5xl">🍽️</p>
              <h2 className="font-display mt-4 text-3xl font-semibold">Nothing matches that craving</h2>
              <p className="mt-2 text-ink/60">Try loosening a filter or searching for something else.</p>
              <button onClick={clearAll} className="mt-6 rounded-full bg-ember px-6 py-3 text-sm font-bold text-paper hover:bg-ember-dark">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <div key={p.id} className="rise" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                  <ProductCard product={p} priority={i < 3} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-sm font-semibold"
    >
      {label}
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-ember" : "bg-sand"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
