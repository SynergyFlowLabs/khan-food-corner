"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartActions, useCart } from "@/lib/cart-store";
import { SHOP } from "@/lib/shop";

const NAV = [
  { href: "/shop", label: "Full Menu" },
  { href: "/shop?category=zinger", label: "Zinger" },
  { href: "/shop?category=bbq", label: "BBQ & Tikka" },
  { href: "/shop?category=deals", label: "Deals" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-ember text-paper shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M12 2c.6 3.4 5 5.4 5 10.2A5 5 0 0 1 12 17.5a5 5 0 0 1-5-5.3c0-1.8.8-2.9 1.8-3.9.1 1.2.7 1.9 1.4 2.3C9.8 7.2 10.6 4.6 12 2zm0 20.5c-2.7 0-4.7-1.4-4.7-3.1 0-.6.4-1.1.9-1.4 1 .6 2.3.9 3.8.9s2.8-.3 3.8-.9c.5.3.9.8.9 1.4 0 1.7-2 3.1-4.7 3.1z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`font-display block text-[1.25rem] font-semibold tracking-tight ${light ? "text-paper" : "text-ink"}`}>
          Khan Food Corner
        </span>
        <span className={`mt-0.5 block text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${light ? "text-saffron" : "text-ember"}`}>
          Rawalpindi · Est. 2014
        </span>
      </span>
    </span>
  );
}

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <>
      <div className="bg-ink text-[0.72rem] font-medium tracking-wide text-paper/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <p className="truncate">
            <span className="text-saffron">●</span> Free delivery on orders above Rs {SHOP.freeDeliveryAbove.toLocaleString()} across Rawalpindi
          </p>
          <a href={SHOP.phoneHref} className="hidden shrink-0 hover:text-saffron sm:block">
            Call {SHOP.phone} · {SHOP.hours}
          </a>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled ? "border-ink/10 bg-cream/90 shadow-sm backdrop-blur-xl" : "border-transparent bg-cream"
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Khan Food Corner home" onClick={() => setMenu(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((n) => {
              const active = n.href === "/shop" && pathname.startsWith("/shop");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`group relative rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-ember ${
                    active ? "text-ember" : "text-ink/80"
                  }`}
                >
                  {n.label}
                  <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded bg-ember transition-transform group-hover:scale-x-100" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={cartActions.openDrawer}
              className="relative flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ember active:scale-95"
              aria-label={`Open cart, ${count} items`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full bg-saffron px-1 text-[0.7rem] font-bold text-ink ${
                  bump ? "animate-pop" : ""
                }`}
                suppressHydrationWarning
              >
                {count}
              </span>
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 md:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-label="Toggle menu"
              aria-expanded={menu}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-0.5 w-5 bg-ink transition-all ${menu ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-ink transition-opacity ${menu ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 h-0.5 w-5 bg-ink transition-all ${menu ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`fixed inset-x-0 top-[104px] bottom-0 z-30 bg-cream transition-all duration-300 md:hidden ${
            menu ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-6 py-6">
            {[{ href: "/", label: "Home" }, ...NAV].map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenu(false)}
                className="font-display border-b border-ink/10 py-4 text-3xl font-medium"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {n.label}
              </Link>
            ))}
            <a href={SHOP.phoneHref} className="mt-8 text-sm font-semibold text-ember">
              Call us: {SHOP.phone}
            </a>
            <p className="mt-1 text-sm text-ink/60">{SHOP.hours}</p>
          </nav>
        </div>
      </header>
    </>
  );
}
