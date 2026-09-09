import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { SEED_PRODUCTS } from "../src/data/catalog.seed.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const p of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        colorway: p.colorway,
        colorwaySwatch: p.colorwaySwatch,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        active: true,
        images: { create: p.images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })) },
        variants: { create: p.variants.map((v) => ({ size: v.size, stock: v.stock })) },
      },
      update: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        colorway: p.colorway,
        colorwaySwatch: p.colorwaySwatch,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
      },
    });
    console.log(`seeded ${p.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
