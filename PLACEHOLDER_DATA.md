# Placeholder data — replace before launch

`PRODUCT.md` forbids inventing prices, sizing, testimonials, press, or story
content. Everything below is fabricated to make the storefront function and is
**clearly marked in code** (`{/* TODO(copy) */}`, `// PLACEHOLDER`). Swap each in
one place.

## Prices (`src/data/catalog.seed.ts` → `priceCents`)

| Product type | Placeholder price |
|---|---|
| Shirts | $24.00 (`2400`) |
| Trousers | $32.00 (`3200`) |
| Bundle | $50.00 (`5000`) |

## Currency (`src/lib/format.ts` → `formatPrice`)

Placeholder symbol: `$`, 2 decimal places, symbol-prefixed. No market stated in
`PRODUCT.md` — confirm currency + locale.

## Market / country (`src/lib/checkout/schema.ts` → `COUNTRIES`)

Placeholder allow-list: a single entry, `"United States"`. Replace with the real
shipping destinations.

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
