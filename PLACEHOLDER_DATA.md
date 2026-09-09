# Placeholder data — replace before launch

`PRODUCT.md` forbids inventing prices, sizing, testimonials, press, or story
content. Everything below is fabricated to make the storefront function and is
**clearly marked in code** (`{/* TODO(copy) */}`, `// PLACEHOLDER`). Swap each in
one place.

## Currency

**PKR (Pakistani Rupee).** `priceCents` / `compareAtCents` in
`src/data/catalog.seed.ts` are **paisa** (Rs × 100); `formatPrice` in
`src/lib/format.ts` renders whole rupees as `Rs 2,990`. Confirm the exact
retail prices.

## Prices (`src/data/catalog.seed.ts` → `priceCents` / `compareAtCents`)

| Product | Price | Was (compare-at) |
|---|---|---|
| Sky Stripe Shirt | Rs 2,990 | Rs 3,990 |
| Burgundy Shirt | Rs 2,490 | — |
| Lilac Shirt | Rs 2,890 | Rs 3,490 |
| Mocha Stripe Shirt | Rs 2,790 | — |
| Butter Stripe Shirt | Rs 2,990 | — |
| Denim Stripe Shirt | Rs 3,290 | Rs 3,990 |
| Mocha Everyday Trouser | Rs 3,990 | — |
| Denim Everyday Trouser | Rs 3,990 | Rs 4,990 |
| Sky + Mocha Bundle | Rs 6,490 | Rs 7,980 |

`compareAtCents` renders as a struck-through "was" price + a "save X%" pill
(`src/components/PriceTag.tsx`, `ProductCard.tsx`).
**TODO(admin):** add a "Compare-at price (was)" field to the admin product form
(`src/app/admin/products/ProductForm.tsx` + `actions.ts`) and a
`compareAtCents` column to the Prisma schema.

## Delivery charge (`src/lib/checkout/shipping.ts` → `SHIPPING_CENTS`)

Flat **Rs 250** per order, added to the total on the cart + checkout screens.
Confirm with the courier.

## Coin images (`public/coin-1re.png`, `coin-5re.png`, `coin-10re.png`)

Real Pakistani coin photos, used as decorative "these are Rupees" stickers on
sale product cards and the PDP price hangtag (`src/lib/coins.ts`). Swap for
better-cut-out / transparent versions if desired.

## Market / country (`src/lib/checkout/schema.ts` → `COUNTRIES`)

Placeholder allow-list: a single entry, `"United States"`. Replace with the real
shipping destinations (likely `"Pakistan"` + cities).

## Size chart (`src/components/SizeGuideContent.tsx` → `SIZE_CHART_CM`)

All measurements are placeholders (generic relaxed-fit womenswear, cm):

| Size | Chest | Waist | Hip | Length |
|---|---|---|---|---|
| XS | 92 | 74 | 98 | 66 |
| S | 96 | 78 | 102 | 67 |
| M | 100 | 82 | 106 | 68 |
| L | 105 | 87 | 111 | 69 |
| XL | 110 | 92 | 116 | 70 |

## Care instructions (PDP "Details" line)

Placeholder: "100% cotton · relaxed fit · machine wash cold". Confirm real care.

## Delivery window (`/checkout/confirmation`)

Placeholder: "2–5 days". Confirm real courier lead time.

## Our Story prose (`src/app/our-story/page.tsx`)

The `SECTIONS` array holds three placeholder chapters ("Where it started", "The
fit philosophy", "One edit at a time") written to *describe* the brand without
inventing a founder name, dates, or specific history. Marked with a `TODO(copy)`
comment. Replace with the real brand story.

## Delivery next-steps (`src/app/checkout/confirmation/page.tsx`)

The `STEPS` array ("we'll call → courier in 2–5 days → pay cash") is placeholder.
Confirm the real process and lead time.

## Contact / social / legal (`src/components/SiteFooter.tsx`)

Placeholder `#` links: Instagram, TikTok, Contact, Privacy, Terms. Needs real
URLs / pages.
