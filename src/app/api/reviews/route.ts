import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const productId = Number(body.productId);
  const rating = Number(body.rating);
  const author = clean(body.author, 60);
  const area = clean(body.area, 60);
  const title = clean(body.title, 100);
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 1000) : "";

  if (!Number.isInteger(productId)) return Response.json({ error: "Unknown product" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ error: "Pick a rating from 1 to 5" }, { status: 400 });
  if (author.length < 2) return Response.json({ error: "Please enter your name" }, { status: 400 });
  if (title.length < 3) return Response.json({ error: "Please add a short title" }, { status: 400 });
  if (text.length < 10) return Response.json({ error: "Review should be at least 10 characters" }, { status: 400 });

  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const [row] = await db
    .insert(reviews)
    .values({ productId, author, area: area || null, rating, title, body: text, verified: 0, createdAt: Date.now() })
    .returning({ id: reviews.id });

  return Response.json({ ok: true, id: row.id }, { status: 201 });
}
