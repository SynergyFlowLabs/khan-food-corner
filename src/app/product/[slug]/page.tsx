import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelated, getReviews } from "@/lib/data";
import { categoryLabel, SPICE_LABELS } from "@/lib/shop";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, SpiceMeter, Stars } from "@/components/ui";
import { Gallery } from "./Gallery";
import { PurchasePanel } from "./PurchasePanel";
import { Reviews } from "./Reviews";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: p.tagline,
    openGraph: { title: p.name, description: p.tagline, images: [p.images[0]] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [reviews, related] = await Promise.all([getReviews(product.id), getRelated(product)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: "Khan Food Corner" },
    offers: { "@type": "Offer", priceCurrency: "PKR", price: product.price, availability: "https://schema.org/InStock" },
    ...(product.reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/55">
        <Link href="/" className="hover:text-ember">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ember">Menu</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-ember">{categoryLabel(product.category)}</Link>
        <span>/</span>
        <span className="font-semibold text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Gallery images={product.images} name={product.name} badges={{ bestseller: product.isBestseller, isNew: product.isNew }} />

        <div className="lg:py-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-ember">{categoryLabel(product.category)}</span>
            <SpiceMeter level={product.spice} showLabel />
          </div>
          <h1 className="font-display mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)] font-medium leading-[1.02] tracking-tight">{product.name}</h1>
          <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm">
            <Stars value={product.rating} size={16} />
            <span className="font-bold">{product.rating ? product.rating.toFixed(1) : "New"}</span>
            <span className="text-ink/55 underline underline-offset-2">({product.reviewCount} reviews)</span>
          </a>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">{product.tagline}</p>

          <PurchasePanel product={product} />

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["⏱", `${product.prepMinutes}–${product.prepMinutes + 15} min`, "Prep & delivery"],
              ["🍽", product.serves, "Serves"],
              ["🔥", product.calories ? `${product.calories} kcal` : "—", "Approx. energy"],
            ].map(([icon, v, l]) => (
              <li key={l} className="rounded-2xl bg-paper px-4 py-3.5 ring-1 ring-ink/5">
                <span className="text-lg">{icon}</span>
                <p className="mt-1 text-sm font-bold">{v}</p>
                <p className="text-xs text-ink/50">{l}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            <details open className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl font-semibold">
                About this dish
                <span className="text-2xl text-ember transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink/70">{product.description}</p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl font-semibold">
                What&apos;s inside
                <span className="text-2xl text-ember transition group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-3 space-y-2 text-ink/70">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 24 24" width="18" height="18" className="mt-0.5 shrink-0 text-ember" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {h}
                  </li>
                ))}
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-ember">✦</span> Spice: {SPICE_LABELS[product.spice]} · 100% halal
                </li>
              </ul>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl font-semibold">
                Delivery & returns
                <span className="text-2xl text-ember transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink/70">
                We deliver across Rawalpindi from 12 PM to 2 AM. Delivery is Rs 150, free above Rs 2,500. If something isn&apos;t right with your order, call us within 30 minutes and we&apos;ll remake or refund it.
              </p>
            </details>
          </div>
        </div>
      </div>

      <Reviews productId={product.id} productName={product.name} reviews={reviews} rating={product.rating} />

      {related.length > 0 && (
        <section className="pt-20">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-medium tracking-tight">You might also like</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
