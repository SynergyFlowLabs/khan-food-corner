import "server-only";
import { and, avg, count, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { orderItems, orders, products, reviews, type ProductRow } from "@/db/schema";
import type { Product, Review, Variant } from "./types";

type Stats = { rating: number; reviewCount: number };

function coerceBoolean(value: number | null | undefined): boolean {
  return Boolean(value);
}

function coerceIso(value: Date | number | string | null): string {
  if (value == null) return new Date().toISOString();
  return new Date(value).toISOString();
}

function coerceJsonArray(value: unknown): unknown[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  // best-sqlite3/drizzle may store JSON text; if decoding once still yields a
  // string (double-encoded), decode once more.
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

function toProduct(row: ProductRow, stats?: Stats): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    price: row.price,
    comparePrice: row.comparePrice,
    images: coerceJsonArray(row.images) as string[],
    variants: coerceJsonArray(row.variants) as Variant[],
    highlights: coerceJsonArray(row.highlights) as string[],
    spice: row.spice,
    isFeatured: coerceBoolean(row.isFeatured),
    isBestseller: coerceBoolean(row.isBestseller),
    isNew: coerceBoolean(row.isNew),
    prepMinutes: row.prepMinutes,
    serves: row.serves,
    calories: row.calories,
    rating: stats?.rating ?? 0,
    reviewCount: stats?.reviewCount ?? 0,
  };
}

async function statsMap(): Promise<Map<number, Stats>> {
  const rows = await db
    .select({ productId: reviews.productId, avg: avg(reviews.rating), n: count() })
    .from(reviews)
    .groupBy(reviews.productId);
  return new Map(
    rows.map((r) => [r.productId, { rating: Math.round(Number(r.avg) * 10) / 10, reviewCount: Number(r.n) }]),
  );
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureSeeded();
  const [rows, stats] = await Promise.all([
    db.select().from(products).orderBy(products.sortOrder),
    statsMap(),
  ]);
  return rows.map((r) => toProduct(r, stats.get(r.id)));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await ensureSeeded();
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return null;
  const [s] = await db
    .select({ avg: avg(reviews.rating), n: count() })
    .from(reviews)
    .where(eq(reviews.productId, row.id));
  return toProduct(row, {
    rating: s?.avg ? Math.round(Number(s.avg) * 10) / 10 : 0,
    reviewCount: Number(s?.n ?? 0),
  });
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const [rows, stats] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.category, product.category), ne(products.id, product.id)))
      .orderBy(desc(products.isBestseller), products.sortOrder)
      .limit(limit),
    statsMap(),
  ]);
  return rows.map((r) => toProduct(r, stats.get(r.id)));
}

export async function getReviews(productId: number): Promise<Review[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
    return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    author: r.author,
    area: r.area,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: Boolean(r.verified),
    createdAt: coerceIso(r.createdAt),
  }));
}

export type HomeReview = Review & { productName: string; productSlug: string };

export async function getTopReviews(limit = 6): Promise<HomeReview[]> {
  await ensureSeeded();
  const rows = await db
    .select({ r: reviews, name: products.name, slug: products.slug })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(and(eq(reviews.rating, 5), eq(reviews.verified, 1), sql`length(${reviews.body}) > 90`))
    .orderBy(sql`random()`)
    .limit(limit);
  return rows.map(({ r, name, slug }) => ({
    id: r.id,
    productId: r.productId,
    author: r.author,
    area: r.area,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: Boolean(r.verified),
    createdAt: coerceIso(r.createdAt),
    productName: name,
    productSlug: slug,
  }));
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
