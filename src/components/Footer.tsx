import Link from "next/link";
import { CATEGORIES, SHOP } from "@/lib/shop";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="grain relative mt-24 overflow-hidden bg-ink text-paper/80">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
            Charcoal-grilled tikka, hand-breaded zinger and smashed burgers — cooked fresh and delivered hot to every corner of Rawalpindi since 2014.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1.5 text-xs font-semibold text-paper">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> 100% Halal · Fresh oil daily
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Menu</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 7).map((c) => (
              <li key={c.key}>
                <Link href={`/shop?category=${c.key}`} className="transition hover:text-saffron">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Shop</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li><Link href="/shop" className="transition hover:text-saffron">Full menu</Link></li>
            <li><Link href="/shop?category=deals" className="transition hover:text-saffron">Deals & combos</Link></li>
            <li><Link href="/shop?sort=popular" className="transition hover:text-saffron">Bestsellers</Link></li>
            <li><Link href="/checkout" className="transition hover:text-saffron">Checkout</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Visit & order</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>{SHOP.address}</li>
            <li>{SHOP.hours}</li>
            <li>
              <a href={SHOP.phoneHref} className="font-semibold text-paper hover:text-saffron">{SHOP.phone}</a>
            </li>
            <li className="text-paper/60">Cash on delivery · Easypaisa · JazzCash</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-paper/50 sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Khan Food Corner, Rawalpindi. All rights reserved.</p>
          <p>Prices in Pakistani Rupees (PKR), inclusive of taxes.</p>
        </div>
      </div>
    </footer>
  );
}
