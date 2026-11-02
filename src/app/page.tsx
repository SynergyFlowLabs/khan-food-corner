import Link from "next/link";
import { getAllProducts, getTopReviews } from "@/lib/data";
import { CATEGORIES, AREAS, SHOP } from "@/lib/shop";
import { formatPKR } from "@/lib/format";
import { px } from "@/lib/img";
import { ProductCard } from "@/components/ProductCard";
import { Img, Reveal, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

const MARQUEE = ["Zinger", "Smash Burgers", "Loaded Fries", "Charcoal Tikka", "Seekh Kebab", "Hot Wings", "Shawarma", "Thick Shakes"];

const FEATURES = [
  { icon: "🔥", title: "Charcoal & fresh oil", text: "Real coals for our tikka & BBQ, fresh oil every single day for our fryers." },
  { icon: "🕌", title: "100% Halal", text: "Premium halal chicken, beef & mutton sourced daily from trusted Pindi suppliers." },
  { icon: "🛵", title: "Hot in ~35 minutes", text: "Dedicated riders and heat-lock packaging. Free delivery above Rs 2,500." },
  { icon: "⭐", title: "Loved by Pindi", text: "Over 12,000 happy orders from Saddar to Bahria and everywhere in between." },
];

export default async function HomePage() {
  const [products, topReviews] = await Promise.all([getAllProducts(), getTopReviews(3)]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const familyFeast = products.find((p) => p.slug === "family-feast");
  const grill = products.find((p) => p.slug === "khan-bbq-platter");
  const bento = CATEGORIES.slice(0, 6);
  const counts = new Map<string, number>();
  products.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="grain relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-ember/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-saffron/20 blur-[110px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-saffron backdrop-blur" style={{ animationDelay: "0.05s" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron" /> Now delivering across Rawalpindi
            </p>
            <h1 className="font-display rise mt-6 text-[clamp(2.9rem,7.5vw,6.2rem)] font-medium leading-[0.95] tracking-tight" style={{ animationDelay: "0.15s" }}>
              Rawalpindi&apos;s <em className="font-semibold italic text-saffron">crunchiest</em> corner.
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-paper/70" style={{ animationDelay: "0.28s" }}>
              Hand-breaded zingers, smashed beef burgers, charcoal tikka and desi BBQ — cooked to order and rushed to your door, hot, until 2 AM.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.4s" }}>
              <Link href="/shop" className="group inline-flex h-14 items-center gap-2 rounded-full bg-ember px-8 text-base font-bold text-paper shadow-xl shadow-ember/30 transition hover:bg-saffron hover:text-ink">
                Order now
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/shop?category=deals" className="inline-flex h-14 items-center rounded-full border border-paper/25 px-7 text-base font-bold transition hover:border-paper hover:bg-paper/10">
                Explore deals
              </Link>
            </div>
            <dl className="rise mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-paper/15 pt-7" style={{ animationDelay: "0.55s" }}>
              {[
                ["4.8★", "Average rating"],
                ["12k+", "Orders delivered"],
                ["35 min", "Avg. delivery"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-paper">{v}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-paper/50">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="arch-in relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-char ring-1 ring-paper/10">
              <Img src={px(17459592, 1200)} alt="Juicy zinger burger held in two hands" priority className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            </div>
            <div className="animate-float absolute -left-2 bottom-16 rounded-2xl bg-paper p-4 text-ink shadow-2xl sm:-left-8" style={{ ["--r" as string]: "-4deg" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-saffron text-xl">🍔</span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-ink/50">Student combo</p>
                  <p className="font-display text-xl font-semibold leading-none">Rs 749</p>
                </div>
              </div>
            </div>
            <div className="animate-float absolute -right-1 top-14 rounded-2xl bg-ink/90 p-4 text-paper shadow-2xl ring-1 ring-paper/15 backdrop-blur sm:-right-6" style={{ ["--r" as string]: "3deg", animationDelay: "1.2s" }}>
              <Stars value={5} size={14} />
              <p className="mt-1.5 text-sm font-semibold">&ldquo;Best zinger in Pindi&rdquo;</p>
              <p className="text-xs text-paper/50">Hamza K. · Satellite Town</p>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden border-y border-paper/10 bg-ember py-4 text-paper">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="font-display flex items-center gap-10 text-2xl font-medium italic">
                {m}
                <span className="text-saffron">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── COLLECTIONS ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ember">Featured collections</p>
              <h2 className="font-display mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-none tracking-tight">
                Pick your craving.
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-bold underline decoration-ember decoration-2 underline-offset-4 hover:text-ember">
              View the full menu →
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:auto-rows-[17rem] lg:grid-cols-4">
          {bento.map((c, i) => {
            const wide = i === 0 || i === 5;
            return (
              <Reveal key={c.key} delay={i * 70} className={wide ? "lg:col-span-2" : ""}>
                <Link
                  href={`/shop?category=${c.key}`}
                  className="group relative block h-full overflow-hidden rounded-3xl bg-char"
                >
                  <Img src={c.image} alt={c.label} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-paper">
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-saffron">
                        {counts.get(c.key) ?? 0} items
                      </p>
                      <h3 className="font-display mt-1 text-3xl font-semibold leading-tight">{c.label}</h3>
                      <p className="mt-1 text-sm text-paper/70">{c.blurb}</p>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-ink transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-saffron">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-5 flex flex-wrap gap-3">
          {CATEGORIES.slice(6).map((c) => (
            <Link
              key={c.key}
              href={`/shop?category=${c.key}`}
              className="rounded-full border border-ink/15 bg-paper px-5 py-2.5 text-sm font-bold transition hover:border-ember hover:bg-ember hover:text-paper"
            >
              {c.label} <span className="text-ink/40">· {counts.get(c.key) ?? 0}</span>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ───────── FAN FAVOURITES ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ember">Fan favourites</p>
            <h2 className="font-display mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-none tracking-tight">
              What Pindi keeps ordering
            </h2>
            <p className="mt-4 text-ink/60">Our most-loved plates, chosen by thousands of repeat customers.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-flex h-13 items-center rounded-full border-2 border-ink px-8 py-3.5 text-sm font-bold transition hover:bg-ink hover:text-paper">
            See all {products.length} items
          </Link>
        </div>
      </section>

      {/* ───────── FEAST BANNER ───────── */}
      {familyFeast && grill && (
        <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal>
              <Link href={`/product/${familyFeast.slug}`} className="group grain relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-ember p-8 text-paper sm:p-10">
                <Img src={familyFeast.images[1]} alt={familyFeast.name} className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply transition-transform duration-[900ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ember/30 to-transparent" />
                <div className="relative">
                  <span className="rounded-full bg-saffron px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink">Save Rs {(familyFeast.comparePrice ?? 0) - familyFeast.price}</span>
                  <h3 className="font-display mt-4 text-4xl font-medium leading-none sm:text-5xl">The Family Feast</h3>
                  <p className="mt-3 max-w-sm text-paper/80">{familyFeast.tagline}</p>
                  <p className="mt-5 flex items-baseline gap-3">
                    <span className="font-display text-4xl font-semibold">{formatPKR(familyFeast.price)}</span>
                    <span className="text-paper/60 line-through">{formatPKR(familyFeast.comparePrice ?? 0)}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <Link href={`/product/${grill.slug}`} className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-char p-8 text-paper sm:p-10">
                <Img src={grill.images[0]} alt={grill.name} className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[900ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <div className="relative">
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink">Feeds 4</span>
                  <h3 className="font-display mt-4 text-4xl font-medium leading-none sm:text-5xl">The Grand BBQ Platter</h3>
                  <p className="mt-3 max-w-sm text-paper/80">{grill.tagline}</p>
                  <p className="mt-5 flex items-baseline gap-3">
                    <span className="font-display text-4xl font-semibold">{formatPKR(grill.price)}</span>
                    <span className="text-paper/60 line-through">{formatPKR(grill.comparePrice ?? 0)}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────── WHY KHAN ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ember">Why Khan Food Corner</p>
            <h2 className="font-display mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1] tracking-tight">
              Street-food soul. <em className="italic text-ember">Kitchen-grade</em> care.
            </h2>
            <p className="mt-5 max-w-md text-ink/65">
              We started as a single tikka counter in Satellite Town. A decade later, the recipe is the same — only the queue got longer, so now we deliver.
            </p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="h-full rounded-3xl bg-paper p-7 ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-2xl">{f.icon}</span>
                  <h3 className="font-display mt-5 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── REVIEWS ───────── */}
      {topReviews.length > 0 && (
        <section className="mt-28 bg-sand/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ember">Word on the street</p>
                <h2 className="font-display mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-none tracking-tight">Real reviews, real crunch.</h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {topReviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 100}>
                  <figure className="flex h-full flex-col rounded-3xl bg-paper p-8 shadow-[0_20px_40px_-28px_rgba(23,17,13,0.5)]">
                    <Stars value={r.rating} size={16} />
                    <blockquote className="font-display mt-5 flex-1 text-xl leading-snug">&ldquo;{r.body}&rdquo;</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ember text-sm font-bold text-paper">{r.author[0]}</span>
                      <div className="text-sm">
                        <p className="font-bold">{r.author}</p>
                        <Link href={`/product/${r.productSlug}`} className="text-ink/55 hover:text-ember">
                          on {r.productName}
                        </Link>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── DELIVERY CTA ───────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-paper sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-ember/40 blur-[90px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-saffron">Delivery zones</p>
                <h2 className="font-display mt-3 text-4xl font-medium leading-tight sm:text-5xl">Hungry anywhere in Pindi? We&apos;re coming.</h2>
                <p className="mt-4 max-w-md text-paper/65">
                  Delivery Rs {SHOP.deliveryFee}, free above {formatPKR(SHOP.freeDeliveryAbove)}. Open {SHOP.hours.toLowerCase()}.
                </p>
                <Link href="/shop" className="mt-8 inline-flex h-13 items-center rounded-full bg-saffron px-8 py-3.5 text-sm font-extrabold text-ink transition hover:bg-paper">
                  Start your order
                </Link>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {AREAS.slice(0, 14).map((a) => (
                  <li key={a} className="rounded-full border border-paper/20 px-4 py-2 text-sm text-paper/80">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
