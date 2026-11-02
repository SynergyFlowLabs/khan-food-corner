import type { Variant } from "./schema";
import { px } from "../lib/img";

export { px };

export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: number;
  comparePrice?: number;
  images: number[];
  variants?: Variant[];
  highlights: string[];
  spice: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  prep: number;
  serves: string;
  calories?: number;
};

const sizes = (a: number, b: number, c?: number): Variant[] => [
  { name: "Regular", price: a },
  { name: "Large", price: b },
  ...(c ? [{ name: "Family", price: c }] : []),
];

export const seedProducts: SeedProduct[] = [
  // ───────── ZINGER ─────────
  {
    slug: "classic-zinger-burger",
    name: "Classic Zinger Burger",
    tagline: "The one that built our name — shatteringly crisp, properly spicy.",
    description:
      "A hand-breaded chicken thigh fillet marinated overnight in our house masala, fried to a deep golden crunch and stacked in a toasted brioche bun with crisp lettuce and our signature garlic-chilli mayo. Juicy inside, loud outside.",
    category: "zinger",
    price: 549,
    images: [8130752, 8769141, 11354487],
    highlights: ["Overnight masala marinade", "Fresh toasted brioche bun", "Signature garlic-chilli mayo"],
    spice: 2, bestseller: true, featured: true, prep: 15, serves: "1", calories: 640,
  },
  {
    slug: "double-zinger-stack",
    name: "Double Zinger Stack",
    tagline: "Two fillets. One cheese slice. Zero regrets.",
    description:
      "Two crispy zinger fillets layered with molten cheddar, pickled jalapeños and crunchy slaw. Built for serious appetites and impossible to eat politely.",
    category: "zinger",
    price: 849, comparePrice: 949,
    images: [17121731, 9207184, 34407059],
    highlights: ["Two full-size fillets", "Molten cheddar slice", "Pickled jalapeños"],
    spice: 2, featured: true, bestseller: true, prep: 18, serves: "1–2", calories: 980,
  },
  {
    slug: "mighty-zinger-supreme",
    name: "Mighty Zinger Supreme",
    tagline: "Zinger fillet, cheese, jalapeño & our smoky red sauce.",
    description:
      "The grown-up zinger. A jumbo fillet, melted cheese, smoked jalapeño rings, caramelised onions and our smoky red sauce for a slow-building heat.",
    category: "zinger",
    price: 749,
    images: [11354487, 8130753, 17459592],
    highlights: ["Jumbo fillet", "Smoky red sauce", "Caramelised onions"],
    spice: 3, isNew: true, prep: 18, serves: "1", calories: 810,
  },
  {
    slug: "zinger-fillet-box",
    name: "Zinger Fillet Box",
    tagline: "Three crunchy strips, fries, coleslaw and a dip.",
    description:
      "Three thick-cut zinger strips with a pile of golden fries, creamy coleslaw and your choice of dip. The ultimate sharing-but-you-won't snack box.",
    category: "zinger",
    price: 899,
    images: [34407059, 11299738, 16962425],
    highlights: ["3 strips of zinger", "Fries + coleslaw", "Choice of dip"],
    spice: 2, bestseller: true, prep: 18, serves: "1–2", calories: 1020,
  },
  {
    slug: "broast-chicken-bucket",
    name: "Broast Chicken Bucket (6 pc)",
    tagline: "Pressure-fried, juicy to the bone, seasoned all the way through.",
    description:
      "Six pieces of pressure-fried broast chicken with a peppery, savoury crust. Served with garlic mayo, chilli sauce and 4 dinner rolls.",
    category: "zinger",
    price: 1499, comparePrice: 1699,
    images: [16962425, 8769141, 9650084],
    highlights: ["6 pieces, mixed cuts", "Two dips + 4 rolls", "Pressure-fried for juiciness"],
    spice: 1, featured: true, prep: 25, serves: "3–4", calories: 2100,
  },

  // ───────── BURGERS ─────────
  {
    slug: "khan-smash-beef-burger",
    name: "Khan Smash Beef Burger",
    tagline: "Smashed patty, lacy crisp edges, American cheese.",
    description:
      "Two thin beef patties smashed hard on the flat-top for crisp, caramelised edges, finished with American cheese, pickles, onions and Khan burger sauce on a soft potato bun.",
    category: "burgers",
    price: 799,
    images: [5609526, 3727243, 4080534],
    highlights: ["100% fresh beef patties", "Smashed for crisp edges", "Potato bun, Khan sauce"],
    spice: 0, featured: true, bestseller: true, prep: 18, serves: "1", calories: 860,
  },
  {
    slug: "double-cheese-beef-burger",
    name: "Double Cheese Beef Burger",
    tagline: "Thick patty, double cheddar, endless melt.",
    description:
      "A juicy 150g flame-grilled beef patty with two layers of cheddar, lettuce, tomato and house relish. A gooey classic done right.",
    category: "burgers",
    price: 999,
    images: [14701528, 8305726, 8880741],
    highlights: ["150g flame-grilled patty", "Double cheddar", "House relish"],
    spice: 0, prep: 20, serves: "1", calories: 920,
  },
  {
    slug: "smokey-bbq-beef-burger",
    name: "Smokey BBQ Beef Burger",
    tagline: "Charcoal-smoked patty, onion rings, tangy BBQ glaze.",
    description:
      "Beef patty glazed in smoky BBQ sauce, topped with crunchy onion rings, cheddar and crisp lettuce. Sweet, smoky and a little sticky.",
    category: "burgers",
    price: 899,
    images: [29056351, 18867543, 4080534],
    highlights: ["Smoky BBQ glaze", "Crunchy onion rings", "Cheddar"],
    spice: 1, prep: 20, serves: "1", calories: 890,
  },
  {
    slug: "jalapeno-fire-burger",
    name: "Jalapeño Fire Burger",
    tagline: "For those who ask for extra spicy and mean it.",
    description:
      "Beef patty with pepper jack-style cheese, fresh and pickled jalapeños, and a fiery red chilli sauce. Brings the heat without hiding the flavour.",
    category: "burgers",
    price: 749,
    images: [18867543, 5609526, 8305726],
    highlights: ["Fresh + pickled jalapeño", "Fiery red chilli sauce", "Melted cheese"],
    spice: 3, isNew: true, prep: 18, serves: "1", calories: 780,
  },
  {
    slug: "peri-peri-grilled-chicken-burger",
    name: "Peri Peri Grilled Chicken Burger",
    tagline: "Lighter, smoky, and glazed in tangy peri peri.",
    description:
      "A flame-grilled chicken breast brushed with peri peri marinade, topped with lettuce, tomato and a cool yogurt-mint drizzle on a toasted bun.",
    category: "burgers",
    price: 649,
    images: [8130753, 17459592, 9207184],
    highlights: ["Grilled, not fried", "Peri peri marinade", "Cool yogurt-mint drizzle"],
    spice: 2, prep: 18, serves: "1", calories: 520,
  },

  // ───────── SIDES ─────────
  {
    slug: "classic-salted-fries",
    name: "Classic Salted Fries",
    tagline: "Skin-on, double-fried, salted the second they land.",
    description:
      "Thick-cut potatoes, blanched and double-fried in fresh oil until fluffy inside and crisp outside. Dusted with sea salt and served with ketchup.",
    category: "sides",
    price: 199,
    variants: sizes(199, 299, 449),
    images: [8272622, 29150162, 8879369],
    highlights: ["Double-fried", "Fresh oil daily", "Ketchup included"],
    spice: 0, bestseller: true, prep: 10, serves: "1–3", calories: 380,
  },
  {
    slug: "masala-fries",
    name: "Masala Fries",
    tagline: "Desi chaat masala meets golden fries.",
    description:
      "Our classic fries tossed in a tangy chaat masala blend with red chilli and a squeeze of lemon. Dangerously snackable.",
    category: "sides",
    price: 249,
    variants: sizes(249, 349, 499),
    images: [15754939, 5779487, 7479383],
    highlights: ["House chaat masala", "Lemon squeeze", "Tangy & spicy"],
    spice: 2, bestseller: true, prep: 10, serves: "1–3", calories: 410,
  },
  {
    slug: "loaded-cheese-fries",
    name: "Loaded Cheese Fries",
    tagline: "Fries drowned in cheese sauce, jalapeños and crispy chicken.",
    description:
      "A tray of crispy fries topped with warm cheese sauce, shredded mozzarella, crunchy chicken bites, jalapeños and a drizzle of garlic mayo.",
    category: "sides",
    price: 449, comparePrice: 499,
    images: [5779487, 27758755, 15754939],
    highlights: ["Warm cheese sauce", "Crispy chicken bites", "Garlic mayo drizzle"],
    spice: 1, featured: true, prep: 15, serves: "1–2", calories: 780,
  },
  {
    slug: "pizza-fries",
    name: "Pizza Fries",
    tagline: "Fries meet pizza: mozzarella, olives, peppers, oregano.",
    description:
      "Golden fries baked under a blanket of mozzarella with chicken tikka chunks, olives, capsicum and oregano — then finished with pizza sauce.",
    category: "sides",
    price: 549,
    images: [27758755, 8879369, 29150162],
    highlights: ["Mozzarella baked", "Tikka chunks", "Pizza sauce finish"],
    spice: 1, isNew: true, prep: 15, serves: "2", calories: 820,
  },
  {
    slug: "crispy-chicken-nuggets",
    name: "Crispy Chicken Nuggets (8 pc)",
    tagline: "Juicy white-meat nuggets with a golden crunch.",
    description:
      "Eight tender chicken nuggets in a seasoned crumb, served with garlic mayo and sweet chilli dips. Kids and grown-ups agree on this one.",
    category: "sides",
    price: 399,
    images: [9650084, 34407059, 16962425],
    highlights: ["100% white meat", "Two dips", "Seasoned crumb"],
    spice: 0, prep: 12, serves: "1–2", calories: 450,
  },
  {
    slug: "garlic-mayo-dip",
    name: "Garlic Mayo Dip",
    tagline: "Our legendary dip, by the tub.",
    description:
      "Creamy, punchy garlic mayo made in-house daily. The reason people reorder. Add one (or three) to any meal.",
    category: "sides",
    price: 70,
    images: [29150162, 8272619, 8272622],
    highlights: ["Made fresh daily", "60g tub"],
    spice: 0, prep: 2, serves: "1", calories: 190,
  },

  // ───────── TIKKA ─────────
  {
    slug: "chicken-tikka-leg-piece",
    name: "Charcoal Chicken Tikka (Leg)",
    tagline: "Smoky, juicy, red from the tandoor.",
    description:
      "A whole chicken leg marinated in yogurt, ginger-garlic and tikka masala for 24 hours, then roasted over live charcoal. Served with raita, chutney and fresh naan.",
    category: "tikka",
    price: 449,
    images: [27848435, 29173114, 9646846],
    highlights: ["24-hour marination", "Live charcoal", "Raita, chutney & naan"],
    spice: 2, bestseller: true, prep: 25, serves: "1", calories: 540,
  },
  {
    slug: "chicken-tikka-boti-platter",
    name: "Chicken Tikka Boti Platter",
    tagline: "Tender boneless boti, mint chutney, kachumber, 2 naan.",
    description:
      "Fifteen pieces of succulent boneless chicken tikka boti grilled on skewers, served on a sizzling platter with kachumber salad, mint chutney, raita and two fresh naan.",
    category: "tikka",
    price: 1199,
    images: [29173114, 5643427, 5840331],
    highlights: ["15 pcs boneless boti", "Sizzling platter", "Includes 2 naan"],
    spice: 2, featured: true, bestseller: true, prep: 28, serves: "2–3", calories: 1100,
  },
  {
    slug: "malai-boti-tikka",
    name: "Malai Boti Tikka",
    tagline: "Creamy, mild, melts-in-the-mouth boti.",
    description:
      "Boneless chicken marinated in cream, cheese, white pepper and cardamom. Gently charred for a soft, buttery bite — the one to order if spice isn't your thing.",
    category: "tikka",
    price: 1299,
    images: [5643427, 5840330, 33737098],
    highlights: ["Cream & cheese marinade", "Mild flavour", "Naan + raita included"],
    spice: 0, prep: 28, serves: "2–3", calories: 1050,
  },
  {
    slug: "charcoal-tikka-wings",
    name: "Charcoal Tikka Wings (6 pc)",
    tagline: "Tikka-marinated wings, charred and glossy.",
    description:
      "Six wings marinated tikka-style and grilled over charcoal until blistered at the edges. Served with mint chutney and lemon.",
    category: "tikka",
    price: 599,
    images: [5840329, 33737098, 5840331],
    highlights: ["6 charred wings", "Mint chutney", "Lemon wedge"],
    spice: 2, isNew: true, prep: 22, serves: "1–2", calories: 560,
  },

  // ───────── BBQ ─────────
  {
    slug: "beef-seekh-kebab",
    name: "Beef Seekh Kebab (4 pc)",
    tagline: "Hand-minced, spiced, and grilled hot over charcoal.",
    description:
      "Four juicy seekh kebabs made with hand-minced beef, green chilli, coriander and our secret spice mix. Served with naan, raita and chutney.",
    category: "bbq",
    price: 799,
    images: [37080242, 38579058, 37080253],
    highlights: ["Hand-minced beef", "Charcoal-grilled", "Naan + raita"],
    spice: 2, bestseller: true, prep: 25, serves: "2", calories: 760,
  },
  {
    slug: "chicken-reshmi-kebab",
    name: "Chicken Reshmi Kebab (4 pc)",
    tagline: "Silky-soft chicken kebab, rich and fragrant.",
    description:
      "Four silky chicken reshmi kebabs blended with cream and cashew paste, gently spiced and grilled. Served with mint chutney and naan.",
    category: "bbq",
    price: 849,
    images: [38579058, 7301037, 37080242],
    highlights: ["Cream & cashew blend", "Mildly spiced", "Mint chutney + naan"],
    spice: 1, prep: 25, serves: "2", calories: 720,
  },
  {
    slug: "mutton-chops-charcoal",
    name: "Mutton Chops (6 pc)",
    tagline: "Fresh-cut chops, slow-marinated, charcoal-kissed.",
    description:
      "Six fresh mutton chops marinated in raw papaya, garlic and whole spices, then grilled over charcoal until crisp outside and tender within.",
    category: "bbq",
    price: 2199,
    images: [27668700, 39059254, 27668701],
    highlights: ["Fresh mutton, never frozen", "Raw papaya tenderiser", "Served with 2 naan"],
    spice: 2, prep: 35, serves: "2–3", calories: 1250,
  },
  {
    slug: "behari-kabab-boti",
    name: "Behari Kabab Boti (12 pc)",
    tagline: "Smoky, tangy strips with fried onion and paprika.",
    description:
      "Twelve slow-marinated beef strips in a behari masala with roasted cumin, fried onion and smoked paprika. Charred just right and served with paratha.",
    category: "bbq",
    price: 999,
    images: [39059254, 27668701, 7301037],
    highlights: ["Smoked paprika masala", "Served with paratha", "Fried onion garnish"],
    spice: 2, prep: 28, serves: "2", calories: 880,
  },
  {
    slug: "khan-bbq-platter",
    name: "Khan Grand BBQ Platter",
    tagline: "Seekh, boti, tikka & chops — a feast for four.",
    description:
      "Our flagship platter: 4 beef seekh kebabs, 8 chicken boti, 2 chicken tikka legs, 2 mutton chops, 4 naan, raita, chutney and salad. Perfect for family dinner or a get-together.",
    category: "bbq",
    price: 3499, comparePrice: 3999,
    images: [27668700, 29173114, 37080242, 39059254],
    highlights: ["Feeds 4 comfortably", "Seekh + boti + tikka + chops", "4 naan, raita & salad"],
    spice: 2, featured: true, bestseller: true, prep: 40, serves: "4", calories: 3200,
  },

  // ───────── WINGS ─────────
  {
    slug: "hot-and-spicy-wings",
    name: "Hot & Spicy Wings (8 pc)",
    tagline: "Crispy, tossed in fiery red sauce, ranch on the side.",
    description:
      "Eight wings fried until shatteringly crisp and tossed in our fiery hot sauce. Served with cool ranch and crunchy celery sticks.",
    category: "wings",
    price: 599,
    images: [27562875, 6941026, 38366577],
    highlights: ["8 crispy wings", "Fiery hot sauce", "Ranch + celery"],
    spice: 3, bestseller: true, prep: 20, serves: "1–2", calories: 720,
  },
  {
    slug: "honey-chilli-wings",
    name: "Honey Chilli Wings (8 pc)",
    tagline: "Sticky, sweet heat with toasted sesame.",
    description:
      "Crispy wings glazed in a honey-chilli sauce and finished with toasted sesame and spring onion. Sweet first, spicy after.",
    category: "wings",
    price: 649,
    images: [36782573, 38366574, 5695607],
    highlights: ["Sticky honey-chilli glaze", "Toasted sesame", "Spring onion"],
    spice: 1, isNew: true, prep: 20, serves: "1–2", calories: 760,
  },
  {
    slug: "bbq-glazed-wings",
    name: "BBQ Glazed Wings (8 pc)",
    tagline: "Smoky-sweet BBQ glaze, baked then flash-fried.",
    description:
      "Eight wings baked until tender, flash-fried for crunch, and brushed with a smoky BBQ glaze. Lick-your-fingers territory.",
    category: "wings",
    price: 649,
    images: [27668690, 9650084, 38366577],
    highlights: ["Smoky-sweet glaze", "Baked + flash-fried", "Extra napkins"],
    spice: 1, prep: 22, serves: "1–2", calories: 740,
  },

  // ───────── WRAPS ─────────
  {
    slug: "chicken-shawarma",
    name: "Chicken Shawarma",
    tagline: "Rawalpindi-style: pita, garlic sauce, pickles, fries inside.",
    description:
      "Slow-roasted marinated chicken shaved to order, rolled in pita with garlic sauce, pickles, cabbage and a handful of fries. Grilled until crisp.",
    category: "wraps",
    price: 299,
    variants: [
      { name: "Regular", price: 299 },
      { name: "Jumbo", price: 449 },
    ],
    images: [29306505, 6416559, 14639388],
    highlights: ["Shaved to order", "Fries inside", "Pressed & crisped"],
    spice: 1, bestseller: true, prep: 12, serves: "1", calories: 480,
  },
  {
    slug: "zinger-paratha-roll",
    name: "Zinger Paratha Roll",
    tagline: "Crispy zinger strips in a flaky paratha with chutney & mayo.",
    description:
      "Flaky, buttery paratha wrapped around crispy zinger strips, crunchy onions, mint chutney and garlic mayo. Street food at its best.",
    category: "wraps",
    price: 449,
    images: [14774690, 18177339, 29306505],
    highlights: ["Flaky tawa paratha", "Crispy zinger strips", "Mint chutney + mayo"],
    spice: 2, featured: true, prep: 15, serves: "1", calories: 620,
  },
  {
    slug: "beef-tikka-paratha-roll",
    name: "Beef Tikka Paratha Roll",
    tagline: "Smoky beef boti, onion rings, chutney, flaky paratha.",
    description:
      "Charcoal-grilled beef tikka pieces rolled in a flaky paratha with sliced onions, lemon and our tangy mint-yoghurt sauce.",
    category: "wraps",
    price: 499,
    images: [34318137, 14639388, 18177339],
    highlights: ["Charcoal-grilled beef", "Tawa paratha", "Mint-yoghurt sauce"],
    spice: 2, prep: 15, serves: "1", calories: 590,
  },
  {
    slug: "shawarma-platter",
    name: "Shawarma Platter",
    tagline: "Two shawarmas plated with fries, salad and garlic sauce.",
    description:
      "Shaved chicken shawarma served platter-style over pita with fries, pickled veg, hummus-style sauce and garlic dip. No wrap, all flavour.",
    category: "wraps",
    price: 599,
    images: [18177339, 5779372, 6416559],
    highlights: ["Over pita, with fries", "Pickles & salad", "Garlic dip included"],
    spice: 1, prep: 15, serves: "1–2", calories: 780,
  },

  // ───────── DEALS ─────────
  {
    slug: "student-combo",
    name: "Student Combo",
    tagline: "Zinger burger + fries + soft drink for less.",
    description:
      "Our Classic Zinger Burger with regular fries and a 345ml soft drink. The best value lunch in Rawalpindi — saves you Rs 140.",
    category: "deals",
    price: 749, comparePrice: 889,
    images: [8130753, 34407059, 11299738],
    highlights: ["Classic Zinger", "Regular fries", "345ml soft drink"],
    spice: 2, bestseller: true, featured: true, prep: 18, serves: "1", calories: 1080,
  },
  {
    slug: "midnight-munch-duo",
    name: "Midnight Munch Duo",
    tagline: "2 burgers, 2 fries, 2 shakes — date night, sorted.",
    description:
      "Pick any two (Zinger or Smash beef), two regular fries and two thick shakes. Open till 2 AM so you can order it at any hour of the night.",
    category: "deals",
    price: 2199, comparePrice: 2549,
    images: [17459592, 14701528, 32938774],
    highlights: ["2 burgers of your choice", "2 regular fries", "2 thick shakes"],
    spice: 1, prep: 25, serves: "2", calories: 2300,
  },
  {
    slug: "family-feast",
    name: "Family Feast",
    tagline: "4 zingers, nuggets, 2 large fries and a 1.5L drink.",
    description:
      "Feeds the whole family: 4 Classic Zingers, 8 chicken nuggets, 2 large fries, 4 dips and a 1.5L drink. Delivered hot and packed to stay crisp.",
    category: "deals",
    price: 3299, comparePrice: 3899,
    images: [16962425, 8769141, 9207184, 34407059],
    highlights: ["4 Classic Zingers", "8 nuggets + 2 large fries", "1.5L drink + 4 dips"],
    spice: 2, featured: true, bestseller: true, prep: 30, serves: "4–5", calories: 4800,
  },

  // ───────── DRINKS ─────────
  {
    slug: "oreo-thick-shake",
    name: "Oreo Thick Shake",
    tagline: "Cookies, cream and a mountain of whipped topping.",
    description:
      "Thick vanilla ice-cream shake blended with Oreo crumble and finished with whipped cream and chocolate drizzle.",
    category: "drinks",
    price: 399,
    images: [34711204, 28525197, 32938774],
    highlights: ["Real ice cream", "Whipped cream", "Chocolate drizzle"],
    spice: 0, prep: 8, serves: "1", calories: 540,
  },
  {
    slug: "strawberry-shake",
    name: "Strawberry Shake",
    tagline: "Fresh strawberry, cold, creamy, nostalgic.",
    description:
      "Real strawberry pulp blended with milk and ice cream. Sweet, bright, and impossibly smooth.",
    category: "drinks",
    price: 379,
    images: [10066812, 32938774, 28525198],
    highlights: ["Real strawberry pulp", "Cream topped"],
    spice: 0, prep: 8, serves: "1", calories: 420,
  },
  {
    slug: "mint-margarita",
    name: "Mint Margarita",
    tagline: "Rawalpindi's favourite cooler: lemon, mint, ice.",
    description:
      "Freshly squeezed lemon, mint leaves and crushed ice blended into a zesty, frosty cooler. The perfect partner to anything spicy.",
    category: "drinks",
    price: 249,
    images: [29653664, 28525197, 34711204],
    highlights: ["Fresh lemon & mint", "Crushed ice", "Dairy-free"],
    spice: 0, bestseller: true, prep: 5, serves: "1", calories: 140,
  },
  {
    slug: "soft-drink",
    name: "Soft Drink",
    tagline: "Ice-cold, always.",
    description: "Choose Pepsi, 7UP, Mirinda or Coke — chilled and ready for your order.",
    category: "drinks",
    price: 90,
    variants: [
      { name: "345ml", price: 90 },
      { name: "1.5L", price: 260 },
    ],
    images: [28525198, 29653664, 32938774],
    highlights: ["Chilled", "Pepsi / 7UP / Mirinda"],
    spice: 0, prep: 2, serves: "1", calories: 140,
  },
];

/* ──────────────── Review generation ──────────────── */

const firstNames = [
  "Ahmed", "Hamza", "Ayesha", "Fatima", "Usman", "Bilal", "Zainab", "Hassan", "Sana", "Ali",
  "Maryam", "Faisal", "Hira", "Talha", "Noor", "Saad", "Iqra", "Danish", "Rabia", "Awais",
  "Kashif", "Mehwish", "Shahzaib", "Areeba", "Junaid", "Laiba", "Omer", "Sidra",
];
const lastInitials = ["K.", "M.", "R.", "S.", "A.", "B.", "Q.", "H.", "J.", "Z.", "T."];
const areas = [
  "Satellite Town", "Bahria Town", "Saddar", "DHA Phase 2", "Chaklala Scheme 3", "Westridge",
  "Commercial Market", "Peshawar Road", "Adiala Road", "Raja Bazaar", "Murree Road", "Gulraiz",
];

const pools: Record<string, { title: string; body: string }[]> = {
  zinger: [
    { title: "Best zinger in Pindi", body: "Crunch is unreal, even after 25 minutes of delivery. The garlic-chilli mayo is addictive. We've ordered three times this week." },
    { title: "Properly spicy, properly juicy", body: "The fillet was thick and juicy, not dry like other places. Bun was toasted and fresh. Easily my go-to now." },
    { title: "Worth every rupee", body: "Portion was generous and the packaging kept everything crisp. Delivery came earlier than promised." },
    { title: "Crispy perfection", body: "That crust! Seasoned all the way through. Only wish I'd ordered the double." },
    { title: "Late night saviour", body: "Ordered at 1 AM and it still arrived hot. Khan Food Corner is a lifesaver for night owls." },
  ],
  burgers: [
    { title: "Juicy and flavourful", body: "The patty has real beefy flavour and the sauce ties it all together. Buns are soft but hold up. Great burger." },
    { title: "Better than the chains", body: "Honestly better than the big-name burger places. Fresh toppings, perfectly melted cheese, and nothing soggy on arrival." },
    { title: "Messy in the best way", body: "Napkins required. Great smoky flavour and the patty was cooked perfectly. Will order again." },
    { title: "Great value", body: "Generous size for the price. Even my brother, who is picky about burgers, finished it in minutes." },
    { title: "Solid 5 stars", body: "Great balance of flavours, nothing too heavy. Came packed neatly and still warm." },
  ],
  sides: [
    { title: "Crispy till the last fry", body: "No limp fries here. Perfectly salted and still crunchy when they arrived. The portion is huge." },
    { title: "Can't stop eating", body: "Ordered one as a side and ended up fighting over it. The seasoning is spot on." },
    { title: "Perfect with the burger", body: "Fluffy inside, crispy outside. Garlic mayo on the side makes it a ten." },
    { title: "Great to share", body: "We shared this between three people and it disappeared in 5 minutes. Tasty and generous." },
  ],
  tikka: [
    { title: "Real charcoal flavour", body: "You can taste the smoke. Meat is tender and well marinated, naan arrived soft. Very authentic." },
    { title: "Tender and juicy", body: "Tikka was so juicy and the mint chutney was fresh. Feels like proper Pindi dhaba quality, delivered." },
    { title: "Family loved it", body: "Ordered for a family dinner. Everyone loved the boti — perfectly spiced and not oily at all." },
    { title: "Best tikka in Saddar", body: "Smoky, tender, and generous portions. The raita was perfect with it. Will reorder this weekend." },
  ],
  bbq: [
    { title: "Authentic BBQ taste", body: "Kebabs were juicy with proper spice and the charcoal smell came through. Naan was fresh and soft." },
    { title: "Great for gatherings", body: "Ordered for 6 people and everyone raved. Meat was cooked perfectly — not dry at all." },
    { title: "Seekh kebab done right", body: "Soft, juicy and properly seasoned. The chutney is the cherry on top. Highly recommended." },
    { title: "Weekend favourite", body: "We order this every Sunday now. Consistent quality and always arrives hot." },
  ],
  wings: [
    { title: "Wings are fire", body: "Crispy outside, juicy inside and the sauce clings perfectly. Spicy, but the ranch calms it down nicely." },
    { title: "Perfect game-night snack", body: "Ordered two portions for a match night. Gone in minutes. Sauce is great." },
    { title: "Crispy and saucy", body: "Not soggy at all even after delivery. Flavour is bold, wings are meaty." },
    { title: "Will order again", body: "Wings were meaty, crispy and hot. The glaze has great depth. Best in the area." },
  ],
  wraps: [
    { title: "Authentic street flavour", body: "Garlic sauce, crispy edges, juicy filling — just like the best street stalls. Super filling." },
    { title: "Perfect lunch", body: "Flaky paratha and well-balanced filling. Not too oily, and the chutney was fresh. Great lunch option." },
    { title: "Shawarma lover approved", body: "Meat was shaved fresh, pita was crisped properly. Great value for the price." },
    { title: "Filling and tasty", body: "Great size, full of flavour. Packed well so nothing leaked. Will definitely reorder." },
  ],
  deals: [
    { title: "Amazing value", body: "Everything arrived hot and the portions were generous. Saves a lot compared to ordering separately." },
    { title: "Perfect for family dinner", body: "Fed the whole family with room to spare. Zingers were crisp, fries hot. Everyone was happy." },
    { title: "Great combo", body: "Great combination of items, good packaging and fast delivery. Highly recommended." },
    { title: "Students' best friend", body: "Great taste, great price. Perfect for hostel nights." },
  ],
  drinks: [
    { title: "Thick and creamy", body: "Proper thick shake, not watery. Sweetness was balanced and the toppings were generous." },
    { title: "So refreshing", body: "Perfect cooler for the Rawalpindi summers. Came ice cold in a sealed cup." },
    { title: "Great with spicy food", body: "Ordered to go with the wings and it was the perfect match. Fresh and flavourful." },
  ],
};

// Deterministic PRNG so seeding is stable.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SeedReview = {
  slug: string;
  author: string;
  area: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  daysAgo: number;
};

export function generateReviews(): SeedReview[] {
  const out: SeedReview[] = [];
  seedProducts.forEach((p, idx) => {
    const rnd = mulberry32(1000 + idx * 31);
    const pool = pools[p.category] ?? pools.zinger;
    const count = 4 + Math.floor(rnd() * 5); // 4-8
    const used = new Set<string>();
    for (let i = 0; i < count; i++) {
      const tpl = pool[Math.floor(rnd() * pool.length)];
      const r = rnd();
      const rating = r < 0.62 ? 5 : r < 0.9 ? 4 : r < 0.97 ? 3 : 2;
      const author = `${firstNames[Math.floor(rnd() * firstNames.length)]} ${lastInitials[Math.floor(rnd() * lastInitials.length)]}`;
      if (used.has(author)) continue;
      used.add(author);
      out.push({
        slug: p.slug,
        author,
        area: areas[Math.floor(rnd() * areas.length)],
        rating,
        title: rating >= 4 ? tpl.title : "Good, but could be better",
        body:
          rating >= 4
            ? tpl.body
            : "Taste was good and delivery was on time, but I expected it to be a bit hotter. Would still order again.",
        verified: rnd() > 0.15,
        daysAgo: 2 + Math.floor(rnd() * 150),
      });
    }
  });
  return out;
}
