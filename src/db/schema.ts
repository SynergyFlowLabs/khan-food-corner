import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export type Variant = { name: string; price: number };

export const products = sqliteTable(
  "products",
  {
    id: integer("id").notNull().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    price: integer("price").notNull(),
    comparePrice: integer("compare_price"),
    // Stored as JSON text; parsed back into arrays at the read boundary.
    images: text("images").notNull(),
    variants: text("variants").notNull(),
    highlights: text("highlights").notNull(),
    spice: integer("spice").notNull().default(0),
    isFeatured: integer("is_featured").notNull().default(0),
    isBestseller: integer("is_bestseller").notNull().default(0),
    isNew: integer("is_new").notNull().default(0),
    prepMinutes: integer("prep_minutes").notNull().default(20),
    serves: text("serves").notNull(),
    calories: integer("calories"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").notNull().primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    area: text("area"),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    verified: integer("verified").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

export const orders = sqliteTable("orders", {
  id: integer("id").notNull().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  area: text("area").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("received"),
  createdAt: integer("created_at").notNull(),
});

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").notNull().primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull(),
    name: text("name").notNull(),
    variantName: text("variant_name"),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    image: text("image"),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export type ProductRow = typeof products.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
