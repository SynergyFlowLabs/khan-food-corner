import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { deliveryFeeFor } from "@/lib/format";
import { AREAS, SHOP } from "@/lib/shop";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const PAYMENTS = ["cod", "easypaisa", "jazzcash"];

function normalisePhone(raw: string) {
  const digits = raw.replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+92|0092|92|0)?(3\d{9})$/);
  return m ? `0${m[1]}` : null;
}

function orderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-4);
  const r = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `KFC-${t}${r}`;
}

type Line = { productId: number; variant: string | null; qty: number };

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  const name = clean(body.name, 100);
  const phone = normalisePhone(clean(body.phone, 30));
  const email = clean(body.email, 160);
  const area = clean(body.area, 80);
  const address = clean(body.address, 300);
  const notes = clean(body.notes, 300);
  const paymentMethod = clean(body.paymentMethod, 20);

  if (name.length < 2) errors.name = "Please enter your full name";
  if (!phone) errors.phone = "Enter a valid mobile number (e.g. 0312 3456789)";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email or leave blank";
  if (!AREAS.includes(area)) errors.area = "Select your delivery area";
  if (address.length < 8) errors.address = "Enter a complete delivery address";
  if (!PAYMENTS.includes(paymentMethod)) errors.paymentMethod = "Select a payment method";

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const lines: Line[] = rawItems
    .map((i: Record<string, unknown>) => ({
      productId: Number(i?.productId),
      variant: typeof i?.variant === "string" && i.variant ? i.variant : null,
      qty: Math.floor(Number(i?.qty)),
    }))
    .filter((l) => Number.isInteger(l.productId) && l.qty >= 1 && l.qty <= 20)
    .slice(0, 40);
  if (lines.length === 0) errors.items = "Your cart is empty";

  if (Object.keys(errors).length) return Response.json({ error: "Please fix the highlighted fields", fields: errors }, { status: 422 });

  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, [...new Set(lines.map((l) => l.productId))]));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const priced: { productId: number; name: string; variantName: string | null; unitPrice: number; quantity: number; image: string }[] = [];
  for (const l of lines) {
    const p = byId.get(l.productId);
    if (!p) return Response.json({ error: "An item in your cart is no longer available. Please refresh your cart." }, { status: 409 });
    // SQLite stores JSON arrays as text.
    const images: string[] = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    const variants: { name: string; price: number }[] =
      typeof p.variants === "string" ? JSON.parse(p.variants) : p.variants;
    let unitPrice = p.price;
    if (l.variant) {
      const v = variants.find((x) => x.name === l.variant);
      if (!v) return Response.json({ error: `${p.name} (${l.variant}) is no longer available.` }, { status: 409 });
      unitPrice = v.price;
    } else if (variants.length) {
      unitPrice = variants[0].price;
      l.variant = variants[0].name;
    }
    priced.push({ productId: p.id, name: p.name, variantName: l.variant, unitPrice, quantity: l.qty, image: images[0] });
  }

  const subtotal = priced.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const deliveryFee = deliveryFeeFor(subtotal, SHOP.freeDeliveryAbove, SHOP.deliveryFee);
  const total = subtotal + deliveryFee;
  const number = orderNumber();

  // Note: better-sqlite3 executes statements synchronously, so we skip the
  // drizzle transaction wrapper (it does not accept async callbacks).
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: number,
      name,
      phone: phone!,
      email: email || null,
      area,
      address,
      notes: notes || null,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      createdAt: Date.now(),
    })
    .returning({ id: orders.id });
  await db.insert(orderItems).values(priced.map((i) => ({ ...i, orderId: order.id })));

  return Response.json({ ok: true, orderNumber: number, total }, { status: 201 });
}
