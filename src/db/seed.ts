import { count } from "drizzle-orm";
import { db, sqlite } from "./index";
import { generateReviews, px, seedProducts } from "./seed-data";
import { products, reviews } from "./schema";

let seeding: Promise<void> | null = null;

// Mirrors src/db/schema.ts so the database is ready on the very first request
// with no separate migration step (drizzle-kit doesn't ship a better-sqlite3
// driver in this toolchain).
const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  images TEXT NOT NULL,
  variants TEXT NOT NULL DEFAULT '[]',
  highlights TEXT NOT NULL DEFAULT '[]',
  spice INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  prep_minutes INTEGER NOT NULL DEFAULT 20,
  serves TEXT NOT NULL DEFAULT '1',
  calories INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  area TEXT,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY NOT NULL,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  variant_name TEXT,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
`;

async function run() {
  sqlite.exec(CREATE_TABLES);
  // better-sqlite3 executes every statement synchronously, so we run without a
  // drizzle transaction wrapper (its SQLite driver does not accept async
  // transaction callbacks). ensureSeeded() serialises callers via the
  // module-level promise below, and every insert here is idempotent.
  const [{ value }] = await db.select({ value: count() }).from(products);
    if (value > 0) return;

    for (let i = 0; i < seedProducts.length; i++) {
      const p = seedProducts[i];
      await db
        .insert(products)
        .values([
          {
            slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          category: p.category,
          price: p.price,
          comparePrice: p.comparePrice ?? null,
          images: JSON.stringify(p.images.map((id) => px(id))),
          variants: JSON.stringify(p.variants ?? []),
          highlights: JSON.stringify(p.highlights),
          spice: p.spice,
          isFeatured: Number(!!p.featured),
          isBestseller: Number(!!p.bestseller),
          isNew: Number(!!p.isNew),
          prepMinutes: p.prep,
          serves: p.serves,
          calories: p.calories ?? null,
          sortOrder: i,
          createdAt: Date.now(),
        },
        ])
        .onConflictDoNothing();
    }

    const rows = await db.select({ id: products.id, slug: products.slug }).from(products);
    const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));
    const now = Date.now();
    const toInsert = generateReviews()
      .filter((r) => idBySlug.has(r.slug))
      .map((r) => ({
        productId: idBySlug.get(r.slug)!,
        author: r.author,
        area: r.area,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: Number(r.verified),
        createdAt: now - r.daysAgo * 86_400_000,
      }));
    if (toInsert.length) await db.insert(reviews).values(toInsert);
}

/** Seeds demo catalogue + reviews the first time the shop is opened (idempotent). */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = run().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}
