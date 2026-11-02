import { px } from "./img";

export const SHOP = {
  name: "Khan Food Corner",
  city: "Rawalpindi",
  phone: "0312 555 0142",
  phoneHref: "tel:+923125550142",
  address: "Shop 14, Commercial Market, Satellite Town, Rawalpindi",
  hours: "Daily · 12 PM – 2 AM",
  freeDeliveryAbove: 2500,
  deliveryFee: 150,
};

export const AREAS = [
  "Saddar",
  "Satellite Town",
  "Commercial Market",
  "Chaklala Scheme 3",
  "Westridge",
  "Murree Road",
  "Raja Bazaar",
  "Peshawar Road",
  "Adiala Road",
  "Gulraiz",
  "Bahria Town (Ph 1–6)",
  "DHA Phase 1–2",
  "Rawal Town",
  "Dhoke Khabba",
  "Other (Rawalpindi)",
];

export type Category = {
  key: string;
  label: string;
  blurb: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  { key: "zinger", label: "Zinger & Crispy", blurb: "Hand-breaded, double-crunch", image: px(17121731, 1000) },
  { key: "burgers", label: "Burgers", blurb: "Smashed, stacked, melted", image: px(5609526, 1000) },
  { key: "sides", label: "Fries & Sides", blurb: "Golden, loaded, shareable", image: px(5779487, 1000) },
  { key: "tikka", label: "Charcoal Tikka", blurb: "24-hour marinade, live coals", image: px(29173114, 1000) },
  { key: "bbq", label: "Desi BBQ", blurb: "Seekh, chops & platters", image: px(37080242, 1000) },
  { key: "wings", label: "Wings", blurb: "Crispy, sticky, fiery", image: px(27562875, 1000) },
  { key: "wraps", label: "Rolls & Shawarma", blurb: "Paratha rolls, pita wraps", image: px(29306505, 1000) },
  { key: "deals", label: "Deals & Combos", blurb: "More food, less rupees", image: px(16962425, 1000) },
  { key: "drinks", label: "Shakes & Drinks", blurb: "Thick shakes, mint coolers", image: px(34711204, 1000) },
];

export const categoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const SPICE_LABELS = ["Mild", "Medium", "Hot", "Extra hot"];
