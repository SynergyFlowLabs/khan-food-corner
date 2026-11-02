import type { Variant } from "@/db/schema";

export type { Variant };

export type Product = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  variants: Variant[];
  highlights: string[];
  spice: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  prepMinutes: number;
  serves: string;
  calories: number | null;
  rating: number;
  reviewCount: number;
};

export type Review = {
  id: number;
  productId: number;
  author: string;
  area: string | null;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
};

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  variant: string | null;
  price: number;
  image: string;
  qty: number;
};
