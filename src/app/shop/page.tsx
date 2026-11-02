import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/data";
import { ShopClient } from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the full Khan Food Corner menu: zinger, burgers, fries, tikka, BBQ, wings, rolls, deals and shakes.",
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <Suspense fallback={<div className="mx-auto h-screen max-w-7xl px-4 py-20 sm:px-6" />}>
      <ShopClient products={products} />
    </Suspense>
  );
}
