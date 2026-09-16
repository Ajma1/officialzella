// Real catalog from the storefront-2 design (Zella.dc.html) — replaces the
// old 9-product placeholder seed. Run with `npm run db:seed`.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import catalogImageUrls from "../catalog-image-urls.json" with { type: "json" };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const img = (key: string) => (catalogImageUrls as Record<string, string>)[key];

// Every product carries S and M only (see docs/superpowers/specs — storefront-2
// design ships two sizes, not the old XS-XL range). Stock is a starting
// placeholder — adjust from /admin/inventory.
const STARTING_STOCK = 25;
const sizes = [
  { size: "S" as const, stock: STARTING_STOCK },
  { size: "M" as const, stock: STARTING_STOCK },
];

const SHIRT_PRICE_CENTS = 285000; // Rs 2,850
const TROUSER_PRICE_CENTS = 325000; // Rs 3,250

const shirts = [
  {
    sku: "SH-PBS",
    slug: "powder-blue-stripe-shirt",
    name: "Powder Blue Stripe",
    colorway: "Powder Blue Stripe",
    colorwaySwatch: "#7fa0cf",
    description:
      "A fine blue-and-white stripe in breathable viscose-cotton. Relaxed through the shoulder with a dropped sleeve and a curved hem that sits easy over a wide-leg trouser.",
    images: [img("b01")],
  },
  {
    sku: "SH-PNK",
    slug: "pink-stripe-shirt",
    name: "Pink Stripe",
    colorway: "Pink Stripe",
    colorwaySwatch: "#eda3c4",
    description:
      "The candy-pink stripe, cut in breathable viscose-cotton so it stays light against the skin. Roomy body, long cuff, and a collar that sits soft and open.",
    images: [img("e10"), img("e01")],
  },
  {
    sku: "SH-CHR",
    slug: "charcoal-pinstripe-shirt",
    name: "Charcoal Pinstripe",
    colorway: "Charcoal Pinstripe",
    colorwaySwatch: "#cfc6b5",
    description:
      "Charcoal pinstripe on an ivory ground, woven as a soft breathable cotton-linen mixture. The linen gives it texture and air; the cotton keeps it soft from the first wear.",
    images: [img("a01"), img("d04")],
  },
  {
    sku: "SH-BTR",
    slug: "butter-check-shirt",
    name: "Butter Check",
    colorway: "Butter Check",
    colorwaySwatch: "#efe3a8",
    description:
      "A pale butter micro-check in breathable soft cotton, made for all types of weather. Light enough for warm afternoons, substantial enough to layer when it turns.",
    images: [img("c01"), img("c02")],
  },
  {
    sku: "SH-CHO",
    slug: "chocolate-stripe-shirt",
    name: "Chocolate Stripe",
    colorway: "Chocolate Stripe",
    colorwaySwatch: "#6b4a38",
    description:
      "Deep chocolate with a fine ivory stripe, in soft cotton that works across every season. Longest of the edit through the back hem — made to wear open over a tee.",
    images: [img("f01"), img("f04")],
  },
  {
    sku: "SH-BUR",
    slug: "burgundy-button-down-shirt",
    name: "Burgundy Button-Down",
    colorway: "Burgundy Button-Down",
    colorwaySwatch: "#6d2733",
    description:
      "The red button-down shirt, in a deep burgundy. Soft cotton for all types of weather, with a relaxed dropped shoulder and tonal buttons. Sharpest worn with the black trouser.",
    images: [img("b09"), img("b07")],
  },
  {
    // Photography still being shot for this colourway — ships with no
    // images, same "coming soon" swatch treatment as the trouser below.
    sku: "SH-NVS",
    slug: "navy-star-shirt",
    name: "Navy Star",
    colorway: "Navy Star",
    colorwaySwatch: "#1e2a44",
    description:
      "Navy soft cotton scattered with a small multi-colour star print — the one print in the edit. Studio photography for this colourway is still being shot.",
    images: [] as string[],
  },
];

const trousers = [
  {
    // Reuses the "worn with" outfit shots from the shirt gallery — this
    // design never shot the trouser alone, only styled with each shirt.
    sku: "TR-IVW",
    slug: "ivory-wide-leg-trouser",
    name: "Ivory Wide-Leg",
    colorway: "Ivory Wide-Leg",
    colorwaySwatch: "#efeae1",
    description:
      "A high-waisted ivory wide-leg in soft breathable cotton-linen mixture, pressed to a clean centre crease. It goes with everything in the edit.",
    images: [img("b01"), img("a01"), img("e10"), img("c01")],
  },
  {
    sku: "TR-BLW",
    slug: "black-wide-leg-trouser",
    name: "Black Wide-Leg",
    colorway: "Black Wide-Leg",
    colorwaySwatch: "#1a1a1a",
    description:
      "The same wide-leg cut in black cotton-linen mixture — the quietest way to wear the brighter shirts, and the natural partner to the burgundy button-down.",
    images: [img("b09")],
  },
  {
    sku: "TR-BGW",
    slug: "beige-wide-leg-trouser",
    name: "Beige Wide-Leg",
    colorway: "Beige Wide-Leg",
    colorwaySwatch: "#cbbda4",
    description:
      "A warm beige in the same soft breathable cotton-linen mixture, cut identically to the ivory and black. Studio photography for this colourway is still being shot.",
    images: [] as string[],
  },
];

async function upsertProduct(
  p: { sku: string; slug: string; name: string; colorway: string; colorwaySwatch: string; description: string; images: string[] },
  category: "SHIRT" | "TROUSER",
  priceCents: number,
) {
  await prisma.product.upsert({
    where: { slug: p.slug },
    create: {
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category,
      colorway: p.colorway,
      colorwaySwatch: p.colorwaySwatch,
      priceCents,
      active: true,
      images: {
        create: p.images.map((url, i) => ({ url, alt: `Zella ${p.name}`, position: i })),
      },
      variants: { create: sizes },
    },
    update: {
      sku: p.sku,
      name: p.name,
      description: p.description,
      category,
      colorway: p.colorway,
      colorwaySwatch: p.colorwaySwatch,
      priceCents,
      active: true,
    },
  });
  console.log(`seeded ${p.slug}`);
}

async function main() {
  const newSlugs = [...shirts, ...trousers].map((p) => p.slug);

  for (const s of shirts) await upsertProduct(s, "SHIRT", SHIRT_PRICE_CENTS);
  for (const t of trousers) await upsertProduct(t, "TROUSER", TROUSER_PRICE_CENTS);

  // Retire everything from the old placeholder catalog (not in the new
  // slug list) rather than deleting — preserves history for any existing
  // orders' foreign keys.
  const { count } = await prisma.product.updateMany({
    where: { slug: { notIn: newSlugs } },
    data: { active: false },
  });
  console.log(`retired ${count} old product(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
