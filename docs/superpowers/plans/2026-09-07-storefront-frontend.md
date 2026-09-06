# Zella Storefront Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Zella customer storefront — catalog listing pages, product detail pages, guest cart, single-page Cash-on-Delivery checkout, and supporting pages — on top of the existing hardcoded landing page, extending the "Coquette Dream Board" design system.

**Architecture:** In-repo typed seed layer (`src/data/catalog.seed.ts`) behind an `async` data-access module (`src/lib/catalog.ts`) so the Supabase/Postgres migration tomorrow is a mechanical rewrite of ~5 function bodies. Guest cart in `localStorage` with a denormalized item snapshot (zero client↔catalog coupling); a `revalidateCart` server action re-checks price/stock. Checkout is one page; `placeOrder` is a server action with a `// TODO(db):` seam that returns a generated order number today and writes `prisma.order.create` tomorrow. All pages are RSC except small interactive islands.

**Tech Stack:** Next.js 16.3.1 (App Router, Turbopack), React 19.2, TypeScript 5, Tailwind v4, Motion 13 (`motion/react`), Zod 4, Vitest (new).

**Spec:** `docs/superpowers/specs/2026-09-07-storefront-frontend-design.md`

## Global Constraints

- Next.js **16.3.1**, React **19.2**, Node **≥ 22.12**. Read `node_modules/next/dist/docs/` before using unfamiliar Next APIs (per `AGENTS.md` — this Next has breaking changes).
- Tailwind **v4** — tokens in `src/app/globals.css` via `:root` + `@theme inline`. No second styling system. No new UI libraries.
- Animation: **Motion 13 only** (`motion/react`). Every animation respects `prefers-reduced-motion` (global `<MotionConfig reducedMotion="user">`).
- Design system is a hard constraint — `DESIGN.md` / `.impeccable/design.json`:
  - ground blush `#fdf0f4`; **cherry `#c81846` is the only loud color** — every primary action; never re-saturate the ground.
  - content on cream-surface `#fff8ef` / cream-warm `#ffeee0`; text espresso ink `#2b1512` **full opacity on the ground** (No-Fade-On-Pink Rule).
  - colorway swatches sample real photo colors only: burgundy `#6d2733`, lilac `#c6b3da`, mocha `#a9926f`, sky `#9cc6e8`, butter `#f2d879`, denim `#5b7bab`.
  - Bagel Fat One = one big headline per page/section (+ cherry-word + underline-squiggle); Fredoka everywhere else; Caveat = handwritten asides only.
  - pill (`rounded-full`) for interactive/nav; soft card 18px/10px for photos; form inputs add a 14px step. Soft diffuse shadows only — no hard-offset block shadows.
  - **no kicker/eyebrow above headings** — use a rotated cherry sticker badge.
  - **every real product photo is a taped Polaroid** (rotated, cream-mounted, sunshine washi-tape, Caveat caption) — never a bare rectangle.
  - `data-cursor-label` on every interactive element; global `:focus-visible` = 3px cherry outline.
- Copy / product truth (`PRODUCT.md`): only **6 real photos** exist (all shirts) — do not fabricate product shots; do not invent prices, sizing numbers, testimonials, press, or story content — ship a clearly-marked placeholder and add it to `PLACEHOLDER_DATA.md`. Preserve confirmed hero/nav/CTA/ticker copy.
- Payment is **COD only** — no card fields, no payment SDK, anywhere.
- Commit after every task. Conventional Commits (`feat:`, `test:`, `refactor:`, `docs:`, `chore:`).

---

## File structure

**Created**

```
src/data/catalog.seed.ts               seed products + variants + image refs
src/lib/catalog.ts                     async data-access (swap seam #1)
src/lib/catalog.helpers.ts             isSoldOut / canAddToCart / variantStock / sort / search (pure)
src/lib/format.ts                      (exists) + formatPrice() with currency
src/lib/cart/store.ts                  framework-free cart store (subscribe/get/mutate + localStorage)
src/lib/cart/CartProvider.tsx          context + useCart() via useSyncExternalStore
src/lib/cart/cart-ui.tsx               {isOpen, open, close} context
src/lib/checkout/schema.ts             zod checkoutSchema (shared client+server)
src/lib/checkout/order-number.ts       ZELLA-XXXXX generator
src/lib/units.ts                       toDisplayUnits(cm, "cm"|"in")
src/app/actions/revalidate-cart.ts     server action (swap seam #2)
src/app/actions/place-order.ts         server action (swap seam #3)

src/components/icons.tsx               Bow/Heart/Bag/Arrow/Sparkle/Cherry (extracted from Hero)
src/components/Polaroid.tsx            taped-frame primitive: photo | placeholder mode
src/components/SiteButton.tsx          pill button/link: primary (cherry, magnetic) | secondary (dashed, Caveat)
src/components/StickerBadge.tsx        rotated cherry badge (sparkle + Caveat text)
src/components/Squiggle.tsx            the hand-drawn underline SVG
src/components/PageHeading.tsx         Bagel headline + cherry word + Squiggle
src/components/SiteHeader.tsx          floating nav pill (over-hero | solid), mobile sheet, search trigger, cart button
src/components/SiteFooter.tsx          cream band, columns, placeholders, Caveat sign-off
src/components/Ticker.tsx              charm-bracelet marquee (extracted from Hero)
src/components/Drawer.tsx              portal + backdrop + focus-trap + Esc + spring slide (one primitive)
src/components/EmptyState.tsx          sticker + Bagel headline + Caveat note + action + optional category links
src/components/ProductCard.tsx         Polaroid applied to a catalog item
src/components/ProductGrid.tsx         responsive <ul> grid, staggered in-view entrance
src/components/CategoryListing.tsx     header + sort control + ProductGrid (shared by 3 routes)
src/components/CartLineItem.tsx        shared row (full + compact read-only variant)
src/components/CartDrawer.tsx          right slide-over
src/components/ProductDetail.tsx       PDP client island (image switch, size/qty, add-to-bag)
src/components/SizeGuideContent.tsx    shared by /size-guide and the PDP drawer
src/components/HeartConfetti.tsx       one-shot, reduced-motion-gated

src/app/shirts/page.tsx | trousers/page.tsx | bundles/page.tsx    thin → <CategoryListing category=…/>
src/app/(catalog)/loading.tsx          Polaroid shimmer skeleton     (or per-route loading.tsx)
src/app/products/[slug]/page.tsx
src/app/cart/page.tsx
src/app/checkout/page.tsx
src/app/checkout/confirmation/page.tsx
src/app/our-story/page.tsx
src/app/lookbook/page.tsx
src/app/size-guide/page.tsx
src/app/search/page.tsx
src/app/not-found.tsx

vitest.config.ts
src/**/__tests__/*.test.ts             co-located unit tests

PLACEHOLDER_DATA.md
```

**Modified**

```
src/app/globals.css        + --danger token; + input sub-system utilities
src/app/layout.tsx         + MotionConfig, CartProvider, SiteHeader/Footer/Ticker/CartDrawer; keep THESIS comment
src/components/Hero.tsx     remove inline <header> + inline ticker; consume shared icons; use SiteButton
src/components/CategoryRows.tsx   rewire hrefs → /shirts /trousers /bundles; blurbs stay
package.json               + vitest, + "test" script
DESIGN.md                  One-Display-Face amendment; --danger; input sub-system
next.config.ts             (no change — remotePatterns already present)
```

---

## Phase 0 — Tooling

### Task 0.1: Vitest setup

**Files:** Create `vitest.config.ts`; Modify `package.json`.

**Interfaces:**
- Produces: `npm test` runs Vitest; test files match `src/**/*.test.ts`.

- [ ] **Step 1:** Install: `npm i -D vitest` (using the portable Node 22.23.2 on PATH).
- [ ] **Step 2:** Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
```

- [ ] **Step 3:** Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] **Step 4:** Create `src/lib/__sanity__.test.ts` with `it("runs", () => expect(1).toBe(1))`; run `npm test`; expect PASS; delete the sanity file.
- [ ] **Step 5:** Commit `chore: add vitest`.

---

## Phase 1 — Foundations (data + pure logic + primitives)

### Task 1.1: Design tokens — `--danger` + input utilities

**Files:** Modify `src/app/globals.css`.

**Interfaces:**
- Produces: Tailwind classes `text-danger` / `border-danger` / `bg-danger`; CSS class `.field` for form inputs.

- [ ] **Step 1:** In `:root` add `--danger: #9a2f2f;`. In `@theme inline` add `--color-danger: var(--danger);`.
- [ ] **Step 2:** Verify contrast: `#9a2f2f` on `#fff8ef` and on `#fdf0f4` ≥ 4.5:1 (compute; adjust darkness if short).
- [ ] **Step 3:** Add an `.field` utility block: cream-warm background, `border-radius: 14px`, `border: 2px solid transparent`, Fredoka inherited, padding `12px 16px`; `.field:focus-visible` handled by the global rule; `.field[aria-invalid="true"]` → `border-color: var(--danger)`.
- [ ] **Step 4:** `npm run build` — expect success (CSS compiles).
- [ ] **Step 5:** Commit `feat: add --danger token and form-field styles`.

### Task 1.2: Seed catalog data

**Files:** Create `src/data/catalog.seed.ts`; Create `PLACEHOLDER_DATA.md`.

**Interfaces:**
- Produces: `types` `Size`, `Category`, `ProductImage`, `Variant`, `Product`; `const SEED_PRODUCTS: Product[]`.
- Consumes: real images in `/public` (`shirt-sky-stripe.jpg`, `shirt-burgundy.jpg`, `shirt-lilac.jpg`, `shirt-mocha-stripe.jpg`, `shirt-yellow-stripe.jpg`, `shirt-blue-stripe.jpg`).

- [ ] **Step 1:** Write the types exactly as in spec §3.
- [ ] **Step 2:** Author 9 products: 6 shirts (one per real photo, colorways Sky/Burgundy/Lilac/Mocha/Butter/Denim, `colorwaySwatch` = the matching hex from Global Constraints, full `variants` XS–XL with varied stock incl. at least one sold-out size and one fully-sold-out product), 2 trousers + 1 bundle with `images: []`. Prices from `PLACEHOLDER_DATA.md` (shirts 2400, trousers 3200, bundle 5000 — cents). Mark 2 products `isNew: true`.
- [ ] **Step 3:** Create `PLACEHOLDER_DATA.md` listing every fabricated value (prices, size chart, story prose, care text, delivery window, market/country, social + legal URLs, contact).
- [ ] **Step 4:** `npx tsc --noEmit` — expect clean.
- [ ] **Step 5:** Commit `feat: seed catalog data`.

### Task 1.3: Data-access module

**Files:** Create `src/lib/catalog.ts`; Create `src/lib/catalog.ts` tests at `src/lib/__tests__/catalog.test.ts`.

**Interfaces:**
- Consumes: `SEED_PRODUCTS`, `Product`, `Category` from `src/data/catalog.seed.ts`.
- Produces (all `async`):
  `getAllProducts(): Promise<Product[]>`,
  `getProductsByCategory(cat: Category): Promise<Product[]>`,
  `getProductBySlug(slug: string): Promise<Product | null>`,
  `searchProducts(query: string): Promise<Product[]>`,
  `getRelatedProducts(product: Product): Promise<Product[]>`.

- [ ] **Step 1: failing tests** `src/lib/__tests__/catalog.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getProductsByCategory, getProductBySlug, searchProducts, getRelatedProducts, getAllProducts } from "@/lib/catalog";

describe("catalog", () => {
  it("filters by category", async () => {
    const shirts = await getProductsByCategory("SHIRT");
    expect(shirts.length).toBeGreaterThan(0);
    expect(shirts.every((p) => p.category === "SHIRT")).toBe(true);
  });
  it("returns null for unknown slug", async () => {
    expect(await getProductBySlug("nope")).toBeNull();
  });
  it("finds a product by slug", async () => {
    const all = await getAllProducts();
    const one = await getProductBySlug(all[0].slug);
    expect(one?.id).toBe(all[0].id);
  });
  it("search matches name/colorway case-insensitively", async () => {
    const r = await searchProducts("SKY");
    expect(r.some((p) => p.colorway?.toLowerCase().includes("sky") || p.name.toLowerCase().includes("sky"))).toBe(true);
  });
  it("search returns [] for empty query", async () => {
    expect(await searchProducts("   ")).toEqual([]);
  });
  it("related excludes self, same category, max 3", async () => {
    const all = await getAllProducts();
    const p = all.find((x) => x.category === "SHIRT")!;
    const rel = await getRelatedProducts(p);
    expect(rel.length).toBeLessThanOrEqual(3);
    expect(rel.every((x) => x.category === "SHIRT" && x.id !== p.id)).toBe(true);
  });
});
```

- [ ] **Step 2:** Run — expect FAIL (module missing).
- [ ] **Step 3:** Implement `src/lib/catalog.ts` reading `SEED_PRODUCTS`. `getProductsByCategory` also filters an `active !== false` convention (seed has no `active` field yet — treat all as active; leave a `// TODO(db): WHERE active` comment). `searchProducts` trims, lowercases, returns `[]` on empty, matches `name` / `colorway` / `category`.
- [ ] **Step 4:** Run — expect PASS.
- [ ] **Step 5:** Commit `feat: catalog data-access module`.

### Task 1.4: Catalog pure helpers

**Files:** Create `src/lib/catalog.helpers.ts`; `src/lib/__tests__/catalog.helpers.test.ts`.

**Interfaces:**
- Consumes: `Product`, `Size` from seed.
- Produces:
  `isSoldOut(p: Product): boolean` (every variant `stock === 0`),
  `variantStock(p: Product, size: Size): number` (0 if size absent),
  `canAddToCart(p: Product, size: Size | null, qty: number): { ok: true } | { ok: false; error: string }`,
  `sortProducts(list: Product[], sort: "new" | "price-asc" | "price-desc"): Product[]` (stable; `"new"` = `isNew` first then seed order).

- [ ] **Step 1:** Failing tests: sold-out detection; `variantStock` for present/absent size; `canAddToCart` — null size → `{ok:false, error:"Pick a size"}`, qty > stock → error, qty 1 in-stock → `{ok:true}`; `sortProducts` price asc/desc ordering + `"new"` puts `isNew` first without mutating input.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement (pure, no side effects; `sortProducts` returns a new array).
- [ ] **Step 4:** Run — PASS.
- [ ] **Step 5:** Commit `feat: catalog helpers`.

### Task 1.5: Price formatting

**Files:** Modify `src/lib/format.ts`; `src/lib/__tests__/format.test.ts`.

**Interfaces:**
- Produces: `formatPrice(cents: number): string` — currency-prefixed (symbol from `PLACEHOLDER_DATA.md`; default `"$"`, flagged). Keeps existing `formatCents` for admin.

- [ ] **Step 1:** Failing test: `formatPrice(2400) === "$24.00"`, `formatPrice(0) === "$0.00"`.
- [ ] **Step 2:** FAIL. **Step 3:** implement using `formatCents`. **Step 4:** PASS. **Step 5:** Commit `feat: formatPrice`.

### Task 1.6: Extract icons from Hero

**Files:** Create `src/components/icons.tsx`; Modify `src/components/Hero.tsx`.

**Interfaces:**
- Produces: named exports `BowIcon`, `HeartIcon`, `BagIcon`, `ArrowIcon`, `SparkleIcon`, `CherryIcon` — each `({ size?, className?, ... }) => JSX`, `currentColor`-driven, matching the current inline SVGs verbatim.
- Consumes: none.

- [ ] **Step 1:** Move the six inline icon components out of `Hero.tsx` into `icons.tsx` unchanged (rename to the names above; `HeartIconOuter` → `HeartIcon` keeping the `filled` prop, etc.).
- [ ] **Step 2:** Import them back into `Hero.tsx`; delete the inline copies.
- [ ] **Step 3:** `npm run build` + visual check `/` unchanged (screenshot compare — nav bow, ticker hearts, sticker cherry all present).
- [ ] **Step 4:** Commit `refactor: extract shared icon components`.

### Task 1.7: Polaroid + Squiggle + StickerBadge + SiteButton primitives

**Files:** Create `src/components/Polaroid.tsx`, `Squiggle.tsx`, `StickerBadge.tsx`, `SiteButton.tsx`.

**Interfaces:**
- `Polaroid` props: `{ src?: string; alt?: string; caption?: string; swatch?: string; rotate?: number; size?: "sm"|"md"|"lg"; priority?: boolean; kenburns?: boolean; className?: string; children?: ReactNode }` — `src` absent ⇒ placeholder mode (cream-warm window + large `swatch` circle + Caveat "photo coming soon"). Always renders the sunshine washi-tape + Caveat caption. Uses `next/image` + `.image-outline`.
- `Squiggle` props: `{ className?: string }` — the exact hero underline `<svg viewBox="0 0 140 18">` path.
- `StickerBadge` props: `{ children: ReactNode; note?: string; rotate?: number; float?: boolean; className?: string }` — cherry circle, `SparkleIcon`, Caveat text; `float` → `.animate-float`.
- `SiteButton` props: `{ as?: "button"|"a"; href?: string; variant?: "primary"|"secondary"; magnetic?: boolean } & rest` — `primary` = cherry pill `h-14`, cream text, `shadow-lg shadow-cherry/30`, magnetic hover (port `MagneticLink` math from Hero) + spring tap; `secondary` = transparent, dashed `border-foreground/40`, Caveat label, cherry on hover. Adds `data-cursor-label` from a `label` prop.

- [ ] **Step 1:** Build `Squiggle` (copy the path). Commit `feat: Squiggle`.
- [ ] **Step 2:** Build `SiteButton`, porting `MagneticLink` spring/magnetic behaviour from `Hero.tsx`; support button + anchor. Manual check both variants render. Commit `feat: SiteButton`.
- [ ] **Step 3:** Build `StickerBadge` from the hero's "new season edit" badge markup. Commit `feat: StickerBadge`.
- [ ] **Step 4:** Build `Polaroid` — photo mode from the hero `Polaroid`, add placeholder mode. Render both modes on a scratch route, screenshot desktop + mobile, confirm tape/caption/rotation/hover. Commit `feat: Polaroid primitive`.

### Task 1.8: PageHeading + EmptyState

**Files:** Create `src/components/PageHeading.tsx`, `src/components/EmptyState.tsx`.

**Interfaces:**
- `PageHeading` props: `{ children: string; accent?: string; sub?: ReactNode; className?: string }` — Bagel display; if `accent` given, that substring renders in cherry with `<Squiggle>` beneath. `text-wrap: balance` (global).
- `EmptyState` props: `{ sticker: ReactNode; heading: string; accent?: string; note: string; action?: ReactNode; showCategories?: boolean }` — centered; `showCategories` renders the 3 categories as mini `<Polaroid>` links (`/shirts` etc., using the seed's first image per category or the colorway swatch).

- [ ] **Step 1:** Build `PageHeading`; render "Shirts." with accent "." + squiggle; screenshot. Commit `feat: PageHeading`.
- [ ] **Step 2:** Build `EmptyState`; render a sample; screenshot desktop + mobile. Commit `feat: EmptyState`.

---

## Phase 2 — Layout shell

### Task 2.1: Ticker component

**Files:** Create `src/components/Ticker.tsx`; Modify `src/components/Hero.tsx` (remove inline ticker).

**Interfaces:**
- `Ticker` props: none. Renders the charm-bracelet marquee (`tickerItems` = the confirmed 5 strings, `HeartIcon` at 40% between), `.animate-marquee`, cream band, `border-t-4 border-surface/40`.

- [ ] **Step 1:** Extract the ticker markup + `tickerItems` from `Hero.tsx` into `Ticker.tsx` verbatim.
- [ ] **Step 2:** Remove it from `Hero.tsx` (leave a gap — layout re-adds it globally in Task 2.4).
- [ ] **Step 3:** Commit `refactor: extract Ticker component`.

### Task 2.2: SiteHeader

**Files:** Create `src/components/SiteHeader.tsx`; Modify `src/components/Hero.tsx` (remove inline `<header>`).

**Interfaces:**
- `SiteHeader` props: `{ variant?: "over-hero" | "solid" }` (default `"solid"`).
- Consumes: `useCart().count`, `useCartUi().open`, `icons.tsx`.
- Nav links: `Shirts /shirts`, `Trousers /trousers`, `Bundles /bundles`, `Our Story /our-story`, `Lookbook /lookbook`. Logo → `/`.
- Right: search-trigger pill (→ expands inline input on `md+`, links `/search` on mobile) + cherry circular cart button with a live count badge (`aria-label` "Bag, N items", `data-cursor-label="Bag"`), magnetic.
- Mobile: hamburger → full-screen cream `<Drawer>`-style sheet (can reuse `Drawer` from Task 4.1 — until then a simple `useState` sheet; wire to `Drawer` in Task 4.1).
- Sticky; `solid` = cream pill + `shadow-lg`; `over-hero` = transparent until scrolled ~24px then cross-fades to solid.

- [ ] **Step 1:** Build the desktop pill from the hero `<header>` markup, generalised; wire nav links + cart button (cart count can read `0` until CartProvider exists — Task 3.x wires it; use optional chaining).
- [ ] **Step 2:** Add the scroll-driven `over-hero`→solid transition (`useState` + scroll listener, passive).
- [ ] **Step 3:** Add the mobile menu sheet.
- [ ] **Step 4:** Remove `<header>` from `Hero.tsx`.
- [ ] **Step 5:** Screenshot `/` (over-hero) — must match the current nav visually — and a scrolled state. Commit `feat: SiteHeader`.

### Task 2.3: SiteFooter

**Files:** Create `src/components/SiteFooter.tsx`.

**Interfaces:** props none. Columns *Shop* (Shirts/Trousers/Bundles/Lookbook), *About* (Our Story), *Help* (Size guide, Search, "Contact — `#` TODO"). Brand mark + "Loose Cotton, Made to Move". `InstagramIcon`/`TikTokIcon` placeholders (add to `icons.tsx`, link `#`). `© Zella {year}` + Privacy/Terms (`#`, TODO). Caveat aside "made for girls who don't sit still." Cream-surface, dashed top border.

- [ ] **Step 1:** Add the two social icons to `icons.tsx`.
- [ ] **Step 2:** Build the footer.
- [ ] **Step 3:** Screenshot desktop + mobile. Commit `feat: SiteFooter`.

### Task 2.4: Wire the layout shell

**Files:** Modify `src/app/layout.tsx`, `src/app/page.tsx` (pass `over-hero`), `src/components/Hero.tsx` (final cleanup).

**Interfaces:**
- Consumes: `SiteHeader`, `SiteFooter`, `Ticker`, `MotionConfig`, `CartProvider` (Task 3.x — until then wrap a passthrough), `CartUiProvider`, `CartDrawer` (Task 5.x — until then omit).

- [ ] **Step 1:** Add `<MotionConfig reducedMotion="user">` around the body content. Keep the `THESIS:` comment.
- [ ] **Step 2:** Render `<SiteHeader />` + `{children}` + `<Ticker />` + `<SiteFooter />`. Home page renders `<SiteHeader variant="over-hero"/>` — so `SiteHeader` must be per-route: instead render it in `layout.tsx` as `solid`, and on `/` override via a route-group or a client `usePathname` check inside `SiteHeader` (`pathname === "/" ? "over-hero" : "solid"`). Choose the `usePathname` approach (one component, no route groups).
- [ ] **Step 3:** Remove `MotionConfig` from `Hero.tsx` (now global) — keep its `<section>`.
- [ ] **Step 4:** Screenshot `/` full page — Hero → Ticker → Footer, visually equivalent to before + a real footer. Screenshot a blank test route to confirm the solid header. Commit `feat: global layout shell`.

### Task 2.5: Rewire CategoryRows links

**Files:** Modify `src/components/CategoryRows.tsx`.

- [ ] **Step 1:** Change `href: "#shirts"` → `"/shirts"`, `"#trousers"` → `"/trousers"`, `"#bundles"` → `"/bundles"`. Keep everything else (blurbs, thumbs, motion).
- [ ] **Step 2:** Use `next/link` instead of `motion.a` with a raw href (wrap `Link` with `motion`), preserving the in-view animation.
- [ ] **Step 3:** Screenshot `/`; click-through to `/shirts` (404 until Phase 3 — acceptable, note it). Commit `refactor: point CategoryRows at real routes`.

---

## Phase 3 — Catalog browsing

### Task 3.1: ProductCard

**Files:** Create `src/components/ProductCard.tsx`; `src/components/__tests__` not needed (visual). Uses `isSoldOut`.

**Interfaces:**
- props: `{ product: Product; index: number }`. Whole card = `next/link` → `/products/{slug}`, `data-cursor-label="View"`.
- Renders `<Polaroid src={product.images[0]?.url} swatch={product.colorwaySwatch} caption={product.colorway ?? undefined} rotate={[-3,2,-2][index % 3]} />` + name (Fredoka semibold) + `formatPrice` below on the ground. `product.isNew` → `<StickerBadge>` corner. `isSoldOut(product)` → rotated "sold out" stamp overlay + `opacity` on the photo + visually-hidden "Sold out" text.

- [ ] **Step 1:** Build it. **Step 2:** Render a grid of all seed products on a scratch route; screenshot desktop + mobile; verify sold-out + placeholder + isNew states. **Step 3:** Commit `feat: ProductCard`.

### Task 3.2: ProductGrid

**Files:** Create `src/components/ProductGrid.tsx`.

**Interfaces:** props `{ products: Product[] }`. `<ul>` `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14`; each `<li>` is a `motion` wrapper with the `CategoryRows` in-view stagger (`delay: i*0.08`). Empty `products` → render nothing (caller shows `<EmptyState>`).

- [ ] **Step 1:** Build. **Step 2:** Scratch-route screenshot. **Step 3:** Commit `feat: ProductGrid`.

### Task 3.3: CategoryListing + routes + loading

**Files:** Create `src/components/CategoryListing.tsx`, `src/app/shirts/page.tsx`, `src/app/trousers/page.tsx`, `src/app/bundles/page.tsx`, `src/app/shirts/loading.tsx` (+ copies for the others, or a shared `loading.tsx` via a `(catalog)` group).

**Interfaces:**
- `CategoryListing` props: `{ category: Category; sort?: string }` (RSC). Fetches `getProductsByCategory`, applies `sortProducts` (default `"new"`), renders `<PageHeading accent>` + intro (from a `CATEGORY_COPY` map reusing `CategoryRows` blurbs verbatim) + controls row (`"N styles"` + sort pill-links `?sort=new|price-asc|price-desc`, `aria-current`) + `<ProductGrid>` or `<EmptyState>` + closing Caveat lookbook link.
- Route file: `export default function Page({ searchParams }) { return <CategoryListing category="SHIRT" sort={searchParams.sort} /> }` (await `searchParams` per Next 16).

- [ ] **Step 1:** Build `CategoryListing`.
- [ ] **Step 2:** Build the 3 route files + `loading.tsx` (Polaroid shimmer — a `<ul>` of pulsing cream rounded rects at the card aspect).
- [ ] **Step 3:** `generateMetadata` per route (`"Shirts — Zella"` etc.).
- [ ] **Step 4:** Visit all three + a sort variant; screenshot desktop + mobile each. Verify against `DESIGN.md` (Polaroid spec, Bagel headline, no kicker, ticker+footer present).
- [ ] **Step 5:** Commit `feat: category listing pages`.

### Task 3.4: Search

**Files:** Create `src/app/search/page.tsx`; wire the `SiteHeader` search trigger.

**Interfaces:**
- Page (RSC): `searchParams.q`. Empty/blank → `<EmptyState>` prompt (heading "Search.", the pill input, colorway quick-chips linking `?q=sky` etc.). Non-empty → `await searchProducts(q)`; header `results for "{q}"` (q in cherry); a prefilled pill `<form method="get">` input at top; `<ProductGrid>` or `<EmptyState>` no-results (sparkle sticker, `nothing matched "{q}"`, `showCategories`).
- `SiteHeader`: the trigger opens an inline `<form action="/search" method="get">` pill input on `md+`; on mobile it's a link to `/search`.

- [ ] **Step 1:** Build the page.
- [ ] **Step 2:** Wire the header trigger + inline form.
- [ ] **Step 3:** Test `/search`, `/search?q=sky`, `/search?q=zzz`; screenshot each. Commit `feat: product search`.

---

## Phase 4 — Product detail

### Task 4.1: Drawer primitive

**Files:** Create `src/components/Drawer.tsx`; retrofit `SiteHeader`'s mobile sheet to use it.

**Interfaces:**
- props: `{ open: boolean; onClose: () => void; side?: "right" | "full"; label: string; children: ReactNode }`. Portal to `document.body`; backdrop (`bg-foreground/40 backdrop-blur-sm`) closes on click; `Esc` closes; focus trapped; focus returns to the opener; `role="dialog"` `aria-modal` `aria-label={label}`; spring slide-in (`motion`), reduced-motion → instant. Locks body scroll while open.

- [ ] **Step 1:** Build it. **Step 2:** Unit-test the pure bits if any (focus-trap helper) or manual: open/close, Esc, backdrop, tab-cycling, scroll-lock — on a scratch route. **Step 3:** Retrofit `SiteHeader` mobile sheet. **Step 4:** Commit `feat: Drawer primitive`.

### Task 4.2: SizeGuideContent + /size-guide

**Files:** Create `src/components/SizeGuideContent.tsx`, `src/lib/units.ts`, `src/app/size-guide/page.tsx`; `src/lib/__tests__/units.test.ts`.

**Interfaces:**
- `toDisplayUnits(cm: number, unit: "cm" | "in"): string` — `"in"` → `(cm/2.54)` to 1 dp; `"cm"` → integer. Tested: `toDisplayUnits(96,"cm")==="96"`, `toDisplayUnits(2.54,"in")==="1.0"`.
- `SizeGuideContent` props: `{ className?: string }` — fit note + measurement table (rows XS–XL, cols Chest/Waist/Hip/Length from a `SIZE_CHART_CM` constant in `PLACEHOLDER_DATA.md`) + cm/in pill toggle (`useState`) + "how to measure" steps + inline SVG diagram. `tabular-nums`.
- `/size-guide/page.tsx`: `<PageHeading>Size guide.</PageHeading>` + back link + `<SizeGuideContent>`.

- [ ] **Step 1:** units TDD (failing test → impl → pass).
- [ ] **Step 2:** Build `SizeGuideContent` + the SVG diagram.
- [ ] **Step 3:** Build the page. Screenshot desktop + mobile; toggle units. Commit `feat: size guide`.

### Task 4.3: ProductDetail island

**Files:** Create `src/components/ProductDetail.tsx`.

**Interfaces:**
- props: `{ product: Product; related: Product[] }`. Client component.
- Consumes: `useCart().add`, `useCartUi().open`, `canAddToCart`, `variantStock`, `isSoldOut`, `Polaroid`, `SiteButton`, `Drawer` + `SizeGuideContent`, `StickerBadge`, `ProductCard`.
- State: `activeImage` (index), `size: Size | null`, `qty: number`, `guideOpen: boolean`, `added: boolean`.
- Left: large `<Polaroid>` for `product.images[activeImage]` (or placeholder) + mini Polaroid thumbnail buttons (`aria-label` "View image N"); kenburns on the primary. Right: back-link, Bagel name (`clamp(2rem,6vw,3.25rem)`), `formatPrice`, swatch + colorway, description, size `role="group"` (disabled where `variantStock === 0`, struck + sr-only "sold out"), size-guide Caveat link → `Drawer`, qty stepper (max `variantStock(product,size)` capped 10), Add-to-bag `SiteButton` (disabled if `isSoldOut`; on click `canAddToCart` guard → `add` + `open()` + `added` flash with `aria-live`), Caveat COD/fit aside, details label list. Below: "You might also like" Fredoka heading + `related.map(ProductCard)` (row / horizontal-scroll).
- "Pick a size first" → inline `--danger` label when `canAddToCart` fails on click.

- [ ] **Step 1:** Build the left column (image switch + kenburns).
- [ ] **Step 2:** Build the right column (size/qty/add-to-bag + guard + drawer).
- [ ] **Step 3:** Build the related-products row.
- [ ] **Step 4:** Scratch-mount with a seed product (in-stock, one sold-out size, and a fully-sold-out product); screenshot desktop + mobile for each; verify add-to-bag calls the cart (console) and the drawer opens.
- [ ] **Step 5:** Commit `feat: ProductDetail`.

### Task 4.4: /products/[slug] route

**Files:** Create `src/app/products/[slug]/page.tsx`.

**Interfaces:**
- `generateStaticParams` → `(await getAllProducts()).map(p => ({ slug: p.slug }))`.
- `generateMetadata({ params })` → title `"{name} — Zella"`, description = `product.description`, `openGraph.images` = first image.
- Default export (RSC, `async`): `const product = await getProductBySlug((await params).slug); if (!product) notFound();` → `<ProductDetail product={product} related={await getRelatedProducts(product)} />`.

- [ ] **Step 1:** Build the route. **Step 2:** Visit 3 PDPs + a bad slug (→ 404, styled in Phase 7; a bare 404 is fine now). **Step 3:** Screenshot. **Step 4:** Commit `feat: product detail page`.

---

## Phase 5 — Cart

### Task 5.1: Cart store (framework-free)

**Files:** Create `src/lib/cart/store.ts`; `src/lib/cart/__tests__/store.test.ts`.

**Interfaces:**
- `CartItem` (spec §3). Module-level store:
  `getSnapshot(): CartItem[]`, `subscribe(cb): () => void`, `addItem(input, qty=1)`, `setItemQty(productId, size, qty)`, `removeItem(productId, size)`, `clearCart()`, `getCount(items)`, `getSubtotalCents(items)`.
- Persists to `localStorage["zella-cart"]` = `{ v: 1, items }`; reads on init; `window` `storage` event → notify subscribers; all access in try/catch, in-memory fallback.

- [ ] **Step 1: failing tests** (use a `localStorage` mock / `happy-dom`? — keep `environment: "node"` and inject a fake `globalThis.localStorage`): add creates a line; add same product+size merges qty; `setItemQty` clamps to ≥1; `removeItem`; `getSubtotalCents` = Σ price·qty; `getCount` = Σ qty; corrupt JSON in storage → `getSnapshot()` returns `[]`; `clearCart` empties.
- [ ] **Step 2:** FAIL. **Step 3:** implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: cart store`.

### Task 5.2: CartProvider + useCart + cart-ui

**Files:** Create `src/lib/cart/CartProvider.tsx`, `src/lib/cart/cart-ui.tsx`; Modify `src/app/layout.tsx` (wrap).

**Interfaces:**
- `CartProvider` — `useSyncExternalStore(subscribe, getSnapshot, () => [])`; exposes `useCart()` (spec §3 shape; `add` takes the product-derived input).
- `useCartUi()` → `{ isOpen, open, close }`.
- `layout.tsx`: `<CartProvider><CartUiProvider>…</CartUiProvider></CartProvider>`.

- [ ] **Step 1:** Build both providers. **Step 2:** Wire into `layout.tsx`. **Step 3:** `SiteHeader` cart count now live — add an item via a scratch button, see the badge update, reload, badge persists. **Step 4:** Commit `feat: CartProvider + cart-ui context`.

### Task 5.3: CartLineItem

**Files:** Create `src/components/CartLineItem.tsx`.

**Interfaces:** props `{ item: CartItem; variant?: "full" | "compact" }`. `full` = mini tilted `<Polaroid size="sm">` thumb + name (`Link` → PDP) + colorway + size + qty stepper pill (`useCart().setQty`) + line total + remove (`useCart().remove`, small Caveat "remove" / ✕, `data-cursor-label="Remove"`). `compact` = thumb + name/size + `×qty` + line total, no controls. Unavailable (passed `disabled?: boolean`) → dim + `--danger` note.

- [ ] **Step 1:** Build both variants. **Step 2:** Scratch route with 2 items; screenshot. **Step 3:** Commit `feat: CartLineItem`.

### Task 5.4: CartDrawer

**Files:** Create `src/components/CartDrawer.tsx`; Modify `src/app/layout.tsx` (render it).

**Interfaces:** consumes `useCart()`, `useCartUi()`, `Drawer`, `CartLineItem`, `EmptyState`, `SiteButton`. Side `"right"`. Header "Your bag" + count. Body: `items.map(CartLineItem full)` or `<EmptyState>` (heart sticker, Caveat "your bag's feeling light", "Shop the edit", `showCategories`). Footer: subtotal (`formatPrice`, `tabular-nums`) + "Shipping confirmed at checkout" + "Checkout" `SiteButton` → `/checkout` + "View bag" link → `/cart`. Auto-open: in `ProductDetail`'s add handler call `open()` (already speced) — plus a `useEffect` in `CartDrawer` is not needed.

- [ ] **Step 1:** Build. **Step 2:** Render in `layout.tsx`. **Step 3:** Add from a PDP → drawer opens with the line; adjust qty; remove to empty → empty state; Esc closes. Screenshot open state desktop + mobile. **Step 4:** Commit `feat: CartDrawer`.

### Task 5.5: /cart page

**Files:** Create `src/app/cart/page.tsx` (client).

**Interfaces:** `useCart()`. `<PageHeading>Your bag.</PageHeading>` + `max-w-3xl` column of `CartLineItem full` + summary card (subtotal / shipping line / total / "Checkout" `SiteButton` / "Continue shopping" secondary) or `<EmptyState>`.

- [ ] **Step 1:** Build. **Step 2:** Populate + empty; screenshot desktop + mobile. **Step 3:** Commit `feat: cart page`.

---

## Phase 6 — Checkout

### Task 6.1: checkoutSchema

**Files:** Create `src/lib/checkout/schema.ts`; `src/lib/checkout/__tests__/schema.test.ts`.

**Interfaces:**
- `checkoutSchema` (zod) → `CheckoutInput`. Fields: `fullName` (min 2), `phone` (min 7, digits/space/+/-), `email` (optional, `.email()` if present), `line1` (min 3), `line2` (optional), `city` (min 2), `state` (optional), `postalCode` (optional), `country` (enum `COUNTRIES` — from `PLACEHOLDER_DATA.md`, ≥1 entry), `notes` (optional, max 500), `shipToDifferent` (boolean), `recipientName` (required iff `shipToDifferent`).
- `COUNTRIES: readonly string[]`.

- [ ] **Step 1:** failing tests: valid payload passes; missing `fullName` fails; bad `email` fails; absent `email` passes; `country` not in enum fails; `shipToDifferent:true` without `recipientName` fails.
- [ ] **Step 2:** FAIL. **Step 3:** implement. **Step 4:** PASS. **Step 5:** Commit `feat: checkout schema`.

### Task 6.2: order-number generator

**Files:** Create `src/lib/checkout/order-number.ts`; `__tests__/order-number.test.ts`.

**Interfaces:** `generateOrderNumber(): string` → `/^ZELLA-[0-9A-HJ-NP-Z]{5}$/` (Crockford base32, no I/L/O/U), derived from `crypto.randomUUID()`.

- [ ] **Step 1:** failing tests: matches the regex; 1000 calls → no dup.
- [ ] **Step 2:** FAIL. **Step 3:** impl. **Step 4:** PASS. **Step 5:** Commit `feat: order number generator`.

### Task 6.3: revalidateCart action

**Files:** Create `src/app/actions/revalidate-cart.ts`; `src/app/actions/__tests__/revalidate-cart.test.ts`.

**Interfaces:**
- `revalidateCart(items: CartItem[]): Promise<RevalidateResult>` (spec §3 shape). `"use server"`. Reads `getProductBySlug` + `variantStock`; `// TODO(db):` comment. `priceChanged` when snapshot `priceCents` ≠ source; `unavailable` when product missing or `variantStock === 0`. `subtotalCents` recomputed from **source** prices for available lines.

- [ ] **Step 1:** failing tests (mock catalog): clean cart → all `ok`; tampered price → `priceChanged`; unknown slug → `unavailable`; subtotal ignores unavailable lines and uses source price.
- [ ] **Step 2:** FAIL. **Step 3:** impl. **Step 4:** PASS. **Step 5:** Commit `feat: revalidateCart`.

### Task 6.4: placeOrder action

**Files:** Create `src/app/actions/place-order.ts`; `__tests__/place-order.test.ts`.

**Interfaces:**
- `placeOrder(prevState, formData): Promise<PlaceOrderResult>` (spec §3 shape). `"use server"`, `useActionState`-compatible. Parses `formData` via `checkoutSchema` (returns `fieldErrors` on failure), reads the cart items from a hidden `items` JSON field, runs `revalidateCart`, if any `unavailable` → `{ ok:false, error }`, computes `totalCents` from the revalidated subtotal, `generateOrderNumber()`, returns `{ ok:true, orderNumber, totalCents }`. `// TODO(db): prisma.order.create({...address nested create..., paymentMethod:"COD", status:"PENDING", items})`.

- [ ] **Step 1:** failing tests: invalid form → `fieldErrors`; unavailable line → `{ok:false}`; happy path → `{ok:true}` with regex-valid `orderNumber` and `totalCents` = source subtotal (not the client `items` prices).
- [ ] **Step 2:** FAIL. **Step 3:** impl. **Step 4:** PASS. **Step 5:** Commit `feat: placeOrder action`.

### Task 6.5: /checkout page

**Files:** Create `src/app/checkout/page.tsx` (client) + `src/components/CheckoutForm.tsx` + `src/components/OrderSummary.tsx`.

**Interfaces:**
- Page: `useCart()`; empty → `router.replace("/cart")`. On mount `useEffect` → `revalidateCart(items)`; store result; show a `--danger`/notice banner on any correction; disable submit if any `unavailable`.
- `CheckoutForm`: `useActionState(placeOrder, undefined)`. Cream-surface section cards (Contact / Shipping / Notes / Payment), `.field` inputs, `<fieldset>/<legend>`, client-side zod validation on blur + submit (mirror `checkoutSchema`), inline errors (`aria-invalid`/`aria-describedby`), top error-summary region, hidden `items` field = `JSON.stringify(items)`. Payment = static COD card.
- `OrderSummary`: `items.map(CartLineItem compact)` + subtotal + shipping line + Total + "Place order" `SiteButton` (pending → "placing…", disabled on unavailable) + Caveat trust line. Sticky on desktop; collapsible bar on mobile.
- On `state.ok` → write `sessionStorage["zella-last-order"]` = `{ orderNumber, totalCents, email, items, address }`, `clear()`, `router.push("/checkout/confirmation")`.

- [ ] **Step 1:** Build `OrderSummary`.
- [ ] **Step 2:** Build `CheckoutForm` (fields + client validation + error surfaces).
- [ ] **Step 3:** Build the page (guard + revalidate + success handoff).
- [ ] **Step 4:** Manual: empty cart → redirect; fill + submit with errors → inline; valid submit → lands on confirmation with cart cleared. Screenshot desktop + mobile (form, error state, sticky summary, mobile summary bar).
- [ ] **Step 5:** Commit `feat: checkout page`.

### Task 6.6: /checkout/confirmation

**Files:** Create `src/app/checkout/confirmation/page.tsx` (client), `src/components/HeartConfetti.tsx`.

**Interfaces:**
- Reads `sessionStorage["zella-last-order"]` in `useEffect`; absent → `<EmptyState>` "nothing to show" + home link.
- `<PageHeading accent>` "You're in." + `<HeartConfetti />` (one-shot; `useReducedMotion()` → render nothing). Order number cream card + copy button (`navigator.clipboard`, `aria-live` "copied"). "What happens next" 3 Caveat steps. Order recap (`CartLineItem compact` from the stored payload) + total. "Continue shopping" `SiteButton` → `/`. Email line per spec.

- [ ] **Step 1:** `HeartConfetti` (CSS/transform burst, `prefers-reduced-motion` gated).
- [ ] **Step 2:** Build the page.
- [ ] **Step 3:** Reach it via a real checkout; refresh → empty state. Screenshot desktop + mobile + reduced-motion.
- [ ] **Step 4:** Commit `feat: order confirmation`.

---

## Phase 7 — Supporting pages + design-system pass

### Task 7.1: not-found

**Files:** Create `src/app/not-found.tsx`; Create `src/components/icons.tsx` addition `DroppedStitchIcon`.

- [ ] **Step 1:** Add the inline-SVG "dropped stitch" sticker to `icons.tsx`.
- [ ] **Step 2:** `<EmptyState>` — accent "Lost the thread.", Caveat "this page wandered off", "Back to the edit" `SiteButton` → `/`, `showCategories`.
- [ ] **Step 3:** Visit a bad URL; screenshot desktop + mobile. Commit `feat: 404 page`.

### Task 7.2: /our-story

**Files:** Create `src/app/our-story/page.tsx`; add prose to `PLACEHOLDER_DATA.md`.

- [ ] **Step 1:** `max-w-3xl` reading column; `<PageHeading accent>` "Our story."; 3–4 placeholder sections (Fredoka subheads, body from `PLACEHOLDER_DATA.md`, each wrapped `{/* TODO(copy) */}`); interspersed `<Polaroid>` (real photos, alternating alignment); a Caveat pull-quote; "what we stand for" strip reusing ticker facts; closing "Shop the edit" `SiteButton`.
- [ ] **Step 2:** `generateMetadata`.
- [ ] **Step 3:** Screenshot desktop + mobile. Commit `feat: our story page`.

### Task 7.3: /lookbook

**Files:** Create `src/app/lookbook/page.tsx`.

- [ ] **Step 1:** `max-w-7xl`; `<PageHeading accent>` "Lookbook." + Caveat intro; irregular grid of large `<Polaroid>` (the 6 real photos, varied `rotate`/`size`, some overlapping via negative margins / grid spans); each wrapped in a `Link` to the matching PDP with a hover "shop this" cherry pill; floating sticker accents; closing 3-category mini Polaroids.
- [ ] **Step 2:** `generateMetadata`.
- [ ] **Step 3:** Screenshot desktop + mobile; verify only real photos used. Commit `feat: lookbook page`.

### Task 7.4: DESIGN.md + impeccable review

**Files:** Modify `DESIGN.md`; run `impeccable`.

- [ ] **Step 1:** `DESIGN.md` §Typography — amend the One-Display-Face Rule to the codified practice (Bagel = one big headline per page/section; sub-headings Fredoka).
- [ ] **Step 2:** `DESIGN.md` §Colors — add `--danger #9a2f2f` with its role + contrast note.
- [ ] **Step 3:** `DESIGN.md` §Components — add the form input sub-system entry.
- [ ] **Step 4:** Run `impeccable` `critique` on `/checkout` and `audit` on `/shirts` + `/products/[slug]`; apply the batch of fixes it surfaces (one round, per the skill's bounded-passes rule).
- [ ] **Step 5:** Commit `docs: design-system updates for storefront` + any fix commits.

### Task 7.5: Full-site verification pass

**Files:** none (verification) — fixes as needed.

- [ ] **Step 1:** `npm test` — all green.
- [ ] **Step 2:** `npm run build` — clean (no type errors, no lint errors: `npm run lint`).
- [ ] **Step 3:** Screenshot every route desktop + mobile in one batch; check against `DESIGN.md` Do/Don't list (ground not re-saturated, no kicker, Polaroid framing, no hard shadows, cherry-only loud color, `data-cursor-label` coverage, focus-visible rings).
- [ ] **Step 4:** Keyboard-only walk of the cart → checkout → confirmation flow; fix any trap/label gaps.
- [ ] **Step 5:** Reduced-motion pass (confetti off, marquee/kenburns/float off, Motion animations settle instantly).
- [ ] **Step 6:** Update `README.md` with the new routes + "seed data / DB swap" note; update `CLAUDE.md` if needed.
- [ ] **Step 7:** Commit `chore: storefront verification fixes` + `docs: update README`.

---

## Self-review

**Spec coverage:** §3 → Ph1 (1.2–1.5) + Ph5/6 actions. §4 → Ph2. §5 → Ph3. §6 → Ph4. §7 → Ph5+6. §8 → Ph3.4 (search), Ph4.2 (size guide), Ph7 (story/lookbook/404/DESIGN.md). §9 error handling → distributed (revalidate 6.3, notFound 4.4/7.1, EmptyState uses, `.field` errors 6.5). §9 testing → the TDD tasks (1.3–1.5, 4.2, 5.1, 6.1–6.4). §9 a11y → 7.5 Step 4. §10 → not in scope (informational). §11 → 1.2 Step 3, appended in 4.2/6.1/7.2.

**Placeholder scan:** intentional `{/* TODO(copy) */}` / `// TODO(db):` markers are spec-mandated seams, not plan gaps. No "TBD"/"handle edge cases"/"similar to Task N" left.

**Type consistency:** `CartItem`, `Product`, `Size`, `Category` defined in 1.2 and consumed with the same names throughout; `useCart()` shape from spec §3 used identically in 5.2/5.3/5.4/5.5/6.5; `revalidateCart` / `placeOrder` return shapes match spec §3 in 6.3/6.4/6.5.

**Known adaptation:** UI-heavy tasks (components, pages) use "build → scratch-mount → screenshot → verify against DESIGN.md" as the test cycle rather than literal RED-GREEN TDD, because there is no component-test infra this phase (spec §9) and `impeccable`'s screenshot passes + hooks are the real visual gate. Pure-logic tasks keep strict TDD.

## Execution handoff

Two options:
1. **Subagent-Driven** (`superpowers:subagent-driven-development`) — fresh subagent per task, review between.
2. **Inline** (`superpowers:executing-plans`) — batched in this session with checkpoints.
