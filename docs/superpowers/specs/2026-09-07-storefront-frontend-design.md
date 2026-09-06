# Zella Storefront Frontend — Design Spec

**Date:** 2026-09-07
**Status:** Approved (Sections A–E approved in brainstorming; Section F presented alongside this doc)
**Process:** `superpowers:brainstorming` → this spec → `superpowers:writing-plans`
**Classification:** Architectural

---

## 1. Goal

Build the complete customer-facing storefront for Zella on top of the existing
hardcoded landing page: category listing pages, product detail pages, a guest
cart, a single-page Cash-on-Delivery checkout, and the supporting pages (Our
Story, Lookbook, Size Guide, Search, 404).

The existing "Coquette Dream Board" visual world (`DESIGN.md`) is a **hard
constraint** — every new surface extends it; nothing replaces it.

Real database access (Supabase / Postgres) arrives ~2026-09-08. This build runs
against an in-repo typed seed layer behind a swap seam so the DB migration is
mechanical.

---

## 2. Global constraints

### Tech
- Next.js **16.3.1** (App Router, Turbopack), React **19.2**, TypeScript 5.
- Tailwind CSS **v4** (`@theme inline` tokens in `src/app/globals.css`).
- Motion **13** (`motion/react`) — the only animation library.
- Zod **4** for validation (already a dependency).
- Node **≥ 22.12** required (Prisma 7). System Node is 22.11 — a portable Node
  22.23.2 is in use for this session; the developer must upgrade the real Node.
- Vitest for unit tests (new dev dependency — see §9).
- No new UI/component libraries. No second styling system.

### Design system (from `DESIGN.md` / `.impeccable/design.json`)
- **Ground:** blush `#fdf0f4` (`--background`), near-white. Never re-saturate.
- **One loud color:** cherry `#c81846` (`--cherry`) — every primary action, the
  cart, badge fills, the cursor. `cherry-bright #ff2d55` is background-glow only.
- **Content surfaces:** cream-surface `#fff8ef` (`--surface`), cream-warm
  `#ffeee0` (`--surface-warm`).
- **Text:** espresso ink `#2b1512` (`--foreground`) at **full opacity** on the
  ground — the No-Fade-On-Pink Rule. `muted-plum #7a3a56` only on cream.
- **Colorway swatches** sample the real photo colors: burgundy `#6d2733`, lilac
  `#c6b3da`, mocha `#a9926f`, sky `#9cc6e8`, butter `#f2d879`, denim `#5b7bab`.
  Never the decorative pop accents (lime/grape/sunshine/skypop).
- **Type:** Bagel Fat One (display) · Fredoka (body/UI) · Caveat (handwritten
  asides only). See the One-Display-Face amendment in §8.
- **Shape:** pill (`rounded-full`) for interactive/nav; soft card (18px outer /
  10px inner) for photography. Nothing sharp-cornered. (Form inputs add a ~14px
  step — §8.)
- **Depth:** soft diffuse shadows only (`shadow-lg`/`shadow-2xl` tinted
  `background-deep/20–40` or `cherry/30`). No hard-offset block shadows. Ground
  glow never backs a card.
- **Motion:** spring / magnetic / bouncy, never linear ease. All animation
  respects `prefers-reduced-motion` (global `<MotionConfig reducedMotion="user">`
  + the existing `@media (prefers-reduced-motion)` block).
- **No kicker/eyebrow** above any heading — supplementary tags ride a rotated
  cherry sticker badge.
- **Every real product photo** is framed as a taped Polaroid (rotated,
  cream-mounted, sunshine washi-tape, Caveat caption) — never a bare rectangle.
- **Custom cursor** (`CustomCursor`): every interactive element gets a
  `data-cursor-label`.
- Focus: global `:focus-visible` = 3px cherry outline, 3px offset.

### Copy / product-truth rules (from `PRODUCT.md`)
- Brand name **Zella**; tagline "Loose Cotton, Made to Move".
- Only **6 real product photos** exist (all shirts). Do not fabricate additional
  product shots as if real.
- Do **not** invent pricing, testimonials, press, sizing numbers, or founder /
  story content. Where real content is required, ship a clearly-marked
  placeholder and list it in `PLACEHOLDER_DATA.md`.
- Preserve confirmed copy: hero copy, nav items, "Shop the edit" / "See the
  lookbook" CTAs, ticker items (100% cotton, relaxed fit, shirts & trousers, for
  girls who move, new season).

---

## 3. Section A — Architecture & data flow

### Seed layer — `src/data/catalog.seed.ts`

Typed, the single source of truth today.

```ts
export type Size = "XS" | "S" | "M" | "L" | "XL";
export type Category = "SHIRT" | "TROUSER" | "BUNDLE";

export interface ProductImage { url: string; alt: string }
export interface Variant { size: Size; stock: number }

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  colorway: string | null;
  colorwaySwatch: string;   // hex — swatch + placeholder-Polaroid fill
  priceCents: number;       // PLACEHOLDER — see PLACEHOLDER_DATA.md
  images: ProductImage[];   // [] ⇒ "photo coming soon" Polaroid
  variants: Variant[];
  isNew?: boolean;
}
```

**Seed contents:** 6 Shirts mapped to the real photos + colorways
(Sky/Butter/Lilac/Mocha/Burgundy/Denim), 2 Trousers + 1 Bundle with
`images: []` (placeholder treatment). Placeholder prices centralised in
`PLACEHOLDER_DATA.md`.

### Data-access module — `src/lib/catalog.ts` (swap seam #1)

Every function `async` from day one so call sites never change.

```ts
getAllProducts(): Promise<Product[]>
getProductsByCategory(cat: Category): Promise<Product[]>   // active only
getProductBySlug(slug: string): Promise<Product | null>
searchProducts(query: string): Promise<Product[]>
getRelatedProducts(product: Product): Promise<Product[]>   // same category, excl self, ≤3
```

Today: reads the seed array. Tomorrow: function bodies become Prisma queries,
signatures unchanged.

### Cart — `src/lib/cart/`

Client-only, `localStorage` key `zella-cart`, shape `{ v: 1, items: CartItem[] }`.
Cross-tab sync via the `storage` event. All access try/catch with an in-memory
fallback (private mode). Hydration-safe via `useSyncExternalStore` (server
snapshot = empty), mirroring `CustomCursor`'s pattern.

**Denormalized snapshot pattern** — `CartItem` stores what's needed to render
without any catalog access on the client:

```ts
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  colorway: string | null;
  image: string | null;   // first product image, or null for placeholder
  size: Size;
  priceCents: number;     // snapshot at add-time
  qty: number;
}
```

```ts
useCart() → {
  items: CartItem[];
  add(input: { productId; slug; name; colorway; image; size; priceCents }, qty?: number): void;
  setQty(productId: string, size: Size, qty: number): void;   // min 1
  remove(productId: string, size: Size): void;
  clear(): void;
  count: number;          // Σ qty
  subtotalCents: number;  // Σ priceCents·qty
}
```

`add` merges a matching `productId + size` line (sums qty).

### Cart revalidation — `revalidateCart(items)` server action (swap seam #2)

Re-checks each line's price + availability against source of truth. Returns:

```ts
{
  lines: Array<{
    productId; size;
    ok: boolean;
    priceChanged?: { from: number; to: number };
    unavailable?: boolean;   // product or variant gone / stock 0
  }>;
  subtotalCents: number;     // recomputed from source prices
}
```

Today reads the seed; `// TODO(db):` → Prisma tomorrow. Called on `/checkout`
mount and inside `placeOrder`.

### Order placement — `src/app/actions/place-order.ts` (swap seam #3)

`"use server"`. Re-parses `FormData` with the shared `checkoutSchema` (never
trusts the client), re-runs `revalidateCart`, computes `totalCents` server-side
from revalidated prices, generates `orderNumber = "ZELLA-" + 5 base32 chars`
(derived from `crypto.randomUUID()`), returns:

```ts
{ ok: true; orderNumber: string; totalCents: number }
| { ok: false; fieldErrors?: Record<string,string>; error?: string }
```

`// TODO(db):` seam = `prisma.order.create` with nested `address` create,
`paymentMethod: "COD"`, `status: "PENDING"`, `items` from the revalidated cart.
On `ok`, the client writes a one-shot payload to `sessionStorage`
(`zella-last-order`), calls `clear()`, and routes to `/checkout/confirmation`.

### Images

`next.config.ts` already has the Supabase `remotePatterns` entry — no change
needed. Real photos live in `/public`; `next/image` with the existing
`.image-outline` class; cream-warm fallback frame on load error.

---

## 4. Section B — Routing map & layout shell

### Routes

| Route | Type | Notes |
|---|---|---|
| `/` | RSC | existing Hero + CategoryRows; CategoryRows rewired to real category links; Hero `#story`/`#lookbook`/`#cart` anchors → real routes |
| `/shirts` `/trousers` `/bundles` | RSC | three thin files → `<CategoryListing category=… />` |
| `/products/[slug]` | RSC + client island | `generateStaticParams` from `getAllProducts()` |
| `/cart` | client | full-page cart |
| `/checkout` | client | single-page COD checkout |
| `/checkout/confirmation` | client | reads one-shot `sessionStorage` |
| `/our-story` | RSC | placeholder copy |
| `/lookbook` | RSC | editorial gallery of the 6 real photos |
| `/size-guide` | RSC | shares `<SizeGuideContent>` with the PDP drawer |
| `/search` | RSC | `?q=` |
| `app/not-found.tsx` | RSC | coquette 404 |

Category routes are three thin files, **not** a root `[category]` dynamic segment
(which would shadow-compete with the other top-level routes and cost a guard +
`generateStaticParams`).

### Layout shell — `src/app/layout.tsx`

Keep the existing `THESIS:` provenance comment. New tree:

```
<body>
  <MotionConfig reducedMotion="user">
    <CartProvider>                       {/* client boundary */}
      <CustomCursor />
      <SiteHeader />
      {children}
      <Ticker />
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  </MotionConfig>
</body>
```

**Hero refactor:** Hero currently owns an inline `<header>` and a closing
`<Ticker>` band — both move to the layout. On `/` the page stays visually
identical (`Hero → Ticker → Footer`). `SiteHeader` takes
`variant="over-hero" | "solid"` (transparent start on `/`, solid cream pill with
shadow elsewhere; the home page passes `over-hero`).

### New shared components

| Component | Responsibility |
|---|---|
| `src/components/icons.tsx` | Bow, Heart, Bag, Arrow, Sparkle, Cherry — **extracted** from the inline definitions in `Hero.tsx` |
| `src/components/SiteHeader.tsx` | floating cream nav pill, sticky, `over-hero`/`solid` variants, mobile menu sheet, search trigger, cart button + count badge |
| `src/components/SiteFooter.tsx` | cream band, Shop/About/Help columns, brand mark, social + legal placeholders, Caveat sign-off |
| `src/components/Ticker.tsx` | the signature charm-bracelet marquee (extracted from Hero), reused globally |
| `src/components/Drawer.tsx` | portal + backdrop + focus-trap + Esc + return-focus + spring slide — **one primitive**, used by CartDrawer and the size-guide drawer |
| `src/components/CartDrawer.tsx` | right slide-over; `CartLineItem` rows; subtotal; checkout CTA; empty state; auto-open on add |
| `src/components/CartLineItem.tsx` | shared row: mini tilted Polaroid thumb · name → PDP · colorway + size · qty stepper pill · line total · remove. Read-only compact variant for summaries |
| `src/components/ProductCard.tsx` | the Polaroid applied to a catalog item (listing + related + search) |
| `src/components/ProductGrid.tsx` | `<ul>` responsive 2/3/3–4-col grid with staggered in-view entrance |
| `src/components/EmptyState.tsx` | sticker + Bagel headline + Caveat note + action + optional mini-Polaroid category links. Used by: empty cart, empty category, no search results, 404, absent confirmation |
| `src/components/Polaroid.tsx` | the taped-Polaroid frame primitive (extracted/generalised from Hero) — real photo *or* "photo coming soon" placeholder mode |
| `src/components/SiteButton.tsx` | pill button: `primary` (cherry, magnetic, spring tap) / `secondary` (dashed border, Caveat). Wraps `MagneticLink` behaviour from Hero |

### Cart UI state

A tiny separate `cart-ui` context (`{ isOpen, open, close }`) — not mixed into
cart data.

---

## 5. Section C — Listing pages

Shared `<CategoryListing category=… />`. Blush ground, `max-w-7xl`, `px-6`→`px-16`.

- **Header:** Bagel headline (`"Shirts."`, one word/period in cherry with the
  reused hand-drawn underline squiggle SVG) + Fredoka intro reusing the existing
  `CategoryRows` blurbs verbatim. No kicker.
- **Controls row:** uppercase label `"6 styles"` (left) + sort control (right) —
  a `role="group"` of pill links `New · Price ↑ · Price ↓`, `?sort=` searchParam,
  sorted server-side, `aria-current` on the active pill.
- **Grid:** `<ProductGrid>` — 2 / 3 / 3–4 cols, `gap-x-8 gap-y-14`, staggered
  in-view entrance copied from `CategoryRows`
  (`initial={{opacity:0,y:24}}`, `whileInView`, `viewport={{once:true,margin:"-80px"}}`,
  `delay: i*0.08`).
- **`<ProductCard>`:** full Polaroid spec (18/10 corners, cream-warm mount,
  `shadow-2xl` `background-deep/30`, sunshine washi-tape, Caveat colorway
  caption). Rotated at rest (alternating ~−3/+2/−2° by index), straighten +
  scale-up on hover on a spring. Name (Fredoka semibold) + price (`tabular-nums`)
  *below* the frame on the ground, full-opacity ink. `isNew` → corner cherry
  sticker badge. Sold out (all variants stock 0, via `isSoldOut(product)`) →
  rotated "sold out" stamp + dimmed photo, still links through, conveyed in text.
  Placeholder product → same frame, window holds the large colorway swatch circle
  + Caveat "photo coming soon".
- **`loading.tsx`:** Polaroid-shaped shimmer skeletons.
- **Empty category** → `<EmptyState>` ("nothing pinned here yet").
- Closing: one dashed-border Caveat `"see the lookbook →"` link.
- Per-page `<title>` / description.

No pagination, no colorway filter (6 items) — both flagged as easy later adds.

---

## 6. Section D — Product detail page (`/products/[slug]`)

Two-column desktop (`lg:grid-cols-[1.05fr_0.95fr]`), stacked mobile. Blush ground,
`max-w-7xl`. Small Caveat back-link (`"← all shirts"`) to the parent category.

### Left — imagery
Large taped Polaroid + a row of mini tilted Polaroid thumbnails; selecting a
thumb promotes it with a spring crossfade. Single-image → just the one. Placeholder
product → large "photo coming soon" Polaroid. `.animate-kenburns` idle on the
primary (reduced-motion gated). Cherry sticker badge for "new season" / "low
stock".

### Right — info
- **Name** — Bagel Fat One, `clamp(2rem, 6vw, 3.25rem)`, no underline squiggle.
- **Price** — Fredoka, `tabular-nums`, visible placeholder.
- **Colorway** — swatch circle (real photo color) + name.
- **Description** — Fredoka body, full-opacity ink.
- **Size selector** — `role="group"` pill buttons `XS S M L XL`. In stock →
  selectable (`aria-pressed`, cherry ring when active). Out of stock → `disabled`,
  struck, visually-hidden "sold out". "Pick a size first" nudge in `--danger` near
  the selector.
- **Size guide** — dashed-border Caveat link → opens the size-guide `<Drawer>`.
- **Quantity** — pill stepper − / value / + , `tabular-nums`, min 1, max =
  selected-variant stock (cap 10).
- **Add to bag** — primary `SiteButton`, `h-14`, magnetic + spring tap. Calls
  `useCart().add`, cart drawer briefly auto-opens, label flips to Caveat
  "Added ♥" (`aria-live`, reduced-motion aware). Whole product sold out →
  disabled "Sold out" (no waitlist — no infra, flagged).
- Caveat aside: "Cash on delivery · roomy fit — size down if you're between"
  (copy adjustable).
- **Details** — dashed-divided label list "100% cotton · relaxed fit · machine
  wash cold" (care line TODO).

### Below
- **"You might also like"** — Fredoka heading (not Bagel), 2–3 `<ProductCard>`s
  from `getRelatedProducts`, row on desktop / horizontal scroll on mobile.

### Data flow
```
app/products/[slug]/page.tsx (RSC)
  product = await getProductBySlug(params.slug)   → notFound() on miss
  generateStaticParams ← getAllProducts()
  generateMetadata ← name, description, first image (OG)
  <ProductDetail product={product} related={await getRelatedProducts(product)} />
```
`ProductDetail` is the only client component; `related` is passed in as a prop.

### Helpers (pure, unit-tested)
`isSoldOut(product)`, `canAddToCart(product, size, qty) → {ok} | {error}`,
`variantStock(product, size)`.

---

## 7. Section E — Cart & checkout

### `/cart` page
Centered `max-w-3xl`. Bagel "Your bag." Shared `CartLineItem` rows. Unavailable
line → dimmed + `--danger` "no longer available — remove to continue", blocks
checkout. Summary card: subtotal · "Shipping — confirmed at delivery" (copy
flagged) · total · "Checkout" cherry button · "Continue shopping" dashed-Caveat
link. Empty → `<EmptyState>` (big Caveat "your bag's feeling light", floating
heart/bow stickers, "Shop the edit", 3 categories as mini Polaroids).

### `/checkout` — single page, COD
Empty cart → redirect `/cart`. On mount runs `revalidateCart`; corrections → top
banner + price updates; an unavailable line disables "Place order".

Desktop: form left (~60%) + sticky order-summary right (~40%). Mobile: summary
collapses to an `aria-expanded` "Order summary · $X" bar; sticky "Place order · $X"
at the bottom.

**Form** — cream-surface cards, Fredoka section labels:
1. **Contact** — full name, phone (required), email (optional).
2. **Shipping address** — fields 1:1 with the Prisma `Address` model
   (`fullName, phone, line1, line2?, city, state?, postalCode?, country`).
   Country = select (default market flagged — `PRODUCT.md` states none). Optional
   "ship to someone else" toggle → separate recipient name.
3. **Order notes** — optional textarea.
4. **Payment** — one non-interactive cherry-bordered card: "Cash on Delivery —
   pay when it arrives." No radio, no card fields anywhere.

**Input sub-system** (new — §8): ~14px soft corners, cream-warm fill, 2px
transparent border → cherry on focus + the global 3px focus ring; labels above in
Fredoka label type; error = `--danger` border + helper line + icon,
`aria-invalid` / `aria-describedby`.

**Validation** — one zod `checkoutSchema` shared client + server. Client:
validate on blur + submit, inline errors, scroll to first error. Server
(`placeOrder`): re-parse, re-`revalidateCart`, compute total server-side,
generate order number, return one-shot payload. Failure → `--danger` banner
"couldn't place your order — nothing was charged", form + cart preserved via
`useActionState`.

**Order summary panel:** compact read-only `CartLineItem` rows, subtotal,
shipping line, **Total** (bold, `tabular-nums`), "Place order" `SiteButton`
(disabled while pending → Caveat "placing…", or if a line is unavailable), Caveat
trust line "no payment now · pay cash on delivery".

### `/checkout/confirmation`
Reads `sessionStorage` `zella-last-order`; absent → `<EmptyState>` "nothing to
show" + link home. Bagel "You're in." (cherry + squiggle). Gentle one-shot heart
confetti, **fully suppressed under `prefers-reduced-motion`**. Order number in a
cream card, large `tabular-nums`, copy affordance. "What happens next" — 3 Caveat
steps (we'll call → courier in 2–5 days → pay cash), delivery window flagged
TODO. Order recap. "Continue shopping" CTA. Email line: "keep your order number
handy" now; becomes "receipt sent to {email}" only once email infra exists.

---

## 8. Section F — Supporting pages + design-system extensions

### `/our-story`
`max-w-3xl` reading column on the blush ground. Bagel "Our story." (cherry +
squiggle). Fredoka body, line-height 1.6, full-opacity ink. Interspersed taped
Polaroids (real photos) at section breaks, alternating alignment, Caveat
captions. Pull-quotes in Caveat, larger, cherry. Section subheads Fredoka (not
Bagel). **All prose is placeholder** — wrapped in `{/* TODO(copy) */}` and listed
in `PLACEHOLDER_DATA.md`; `PRODUCT.md` forbids inventing story as fact. A static
"what we stand for" strip reusing the ticker facts. Closing "Shop the edit" CTA.

### `/lookbook`
`max-w-7xl`. Bagel "Lookbook." + short Caveat intro. Irregular mood-board grid of
**large** taped Polaroids of the 6 real photos — varied sizes / rotations /
overlap, echoing Hero's Polaroid stack at page scale. Hover: straighten +
ken-burns. Each links to the matching PDP (small cherry "shop this" pill on
hover). Floating bow/heart/sparkle sticker accents. Only the 6 real images
(different crops allowed). Closing: the 3 categories as mini Polaroids.

### `/size-guide` + PDP drawer
Shared `<SizeGuideContent>` rendered both in the `<Drawer>` and as the page body.
- Fit-philosophy note: "Zella is cut roomy — if you like a closer fit, size
  down." (echoes `PRODUCT.md`).
- Measurement table — cream-surface card, rows XS–XL, columns Chest / Waist / Hip
  / Length. **All numbers placeholder**, flagged, in `PLACEHOLDER_DATA.md`.
  `tabular-nums`.
- "How to measure" — 3–4 steps + a friendly inline-SVG line diagram (espresso ink
  on cream; SVG illustration is allowed, it is not photography).
- cm / in unit toggle — pill toggle, client, pure conversion function
  `toDisplayUnits(cm, unit)` (unit-tested).
- Page version adds the Bagel headline + back link; drawer version renders the
  content only, inside the drawer's own header.

### `/search`
Header trigger: magnifier pill → expands to an inline pill input (desktop) or
navigates to `/search` (mobile); submit → `/search?q=`. Page (RSC): reads `q`,
`await searchProducts(q)` (case-insensitive match on name / colorway / category;
`includes` today, Postgres `ilike`/FTS tomorrow). Header mirrors the listing
pattern — `results for "sky"` with the query in cherry. A pill input at the top of
the page too (prefilled) for refining. Results → `<ProductGrid>`. Empty `q` →
prompt `<EmptyState>` ("what are you after?", the input, colorway quick-search
chips). No matches → `<EmptyState>` (sparkle sticker, `nothing matched "{q}"`,
category links). Submit-based — no debounce.

### `app/not-found.tsx`
`<EmptyState>` — Bagel "Lost the thread." (cherry + squiggle), a "dropped stitch"
inline-SVG sticker, Caveat "this page wandered off", "Back to the edit" CTA + the
3 categories as mini Polaroids.

### Design-system extensions — **require `impeccable` review + `DESIGN.md` update**

1. **One-Display-Face Rule amendment.** `DESIGN.md` currently says Bagel Fat One
   appears on the hero H1 only, but `CategoryRows.tsx` already uses `font-display`
   for section headings. **Codify the real practice:** Bagel Fat One = the one
   big expressive headline per page or major section (with the cherry-word +
   underline-squiggle device). Sub-section headings ("You might also like") stay
   Fredoka. Update the rule text in `DESIGN.md` §Typography.
2. **`--danger` token.** No semantic error color exists (cherry = actions). Add
   `--danger: #9a2f2f` (deep brick; verify ≥ 4.5:1 on cream-surface and blush).
   Used **only** for validation errors, unavailable-item notices, and destructive
   confirms. Add to `globals.css` `:root` + `@theme inline`, document in
   `DESIGN.md` §Colors.
3. **Form input sub-system.** New to the world. ~14px soft corners (a deliberate
   third radius between the 10px photo-inset and 18px card), cream-warm fill, 2px
   transparent border → cherry border on focus (plus the global focus ring),
   Fredoka, labels above in label type, `--danger` error treatment. Document in
   `DESIGN.md` §Components.

Run all three past `impeccable` (`critique` / `audit`) before finalising; its
PostToolUse/Stop hooks will flag them and we accept deliberately, once.

---

## 9. Cross-cutting

### Error handling
| Case | Behaviour |
|---|---|
| `getProductBySlug` miss | `notFound()` → coquette 404 |
| Search empty `q` / no matches | `<EmptyState>` prompt / no-results |
| Cart line references removed product/variant | `revalidateCart` flags `unavailable`; UI dims the line + `--danger` note; checkout blocked until removed |
| Variant stock 0 | size pill disabled; whole product → "Sold out" button |
| `localStorage` unavailable | in-memory cart for the session (try/catch) |
| Checkout zod failure | inline field errors, scroll to first, summary not blocked pre-submit |
| `placeOrder` failure | `--danger` banner, cart + form values preserved |
| Confirmation payload absent | `<EmptyState>` + link home |
| Image load failure | cream-warm fallback frame (`.image-outline`) |

### Testing (Vitest — new dev dep + `vitest.config.ts`)
Unit tests for pure logic only (design-iteration phase; no component/E2E infra
yet — Playwright deferred to post-DB):

- `catalog.ts`: category filter (matching + active), sort comparator
  (asc/desc/newest), `getRelatedProducts` (excludes self, same category, ≤3),
  `searchProducts` (name/colorway/category, case-insensitive, empty → []).
- `cart` store: add merges same product+size, qty clamps to stock/min 1, remove,
  `subtotalCents`, `count`, corrupt `localStorage` → empty, `storage`-event sync.
- `isSoldOut`, `canAddToCart`, `variantStock`.
- `checkoutSchema`: required fields, phone format, email optional-but-valid,
  country in allow-list.
- `placeOrder`: rejects invalid payload, rejects unavailable line, `totalCents`
  from source not client, order-number shape `ZELLA-XXXXX`.
- `orderNumber` generator: format + uniqueness over N.
- `revalidateCart`: price-change flag, removed-product flag, clean pass.
- `toDisplayUnits` cm/in conversion.

### Accessibility (applies to every section)
Semantic landmarks; lists as `<ul>/<li>`; forms with `<fieldset>/<legend>`,
`<label for>`, `aria-invalid` + `aria-describedby`, top error-summary region;
`role="group"` + `aria-label` on size/sort controls with `aria-pressed` /
`aria-current`; `aria-live` for "Added ♥", cart-count, and checkout banners;
drawer focus-trap + Esc + return-focus; focus moved to the confirmation headline
on arrival; sold-out / unavailable conveyed in text, never color alone; all
interactive elements keyboard-operable and `data-cursor-label`-tagged.

---

## 10. Tomorrow's DB migration (informational — not this build)

When Supabase access lands:

1. **Schema additions** to `prisma/schema.prisma`:
   - `model ProductVariant { id, productId, size (enum Size {XS S M L XL}), stock Int, @@unique([productId, size]) }`
   - `Product` gains `variants ProductVariant[]`.
   - `OrderItem` gains `size Size` (or `variantId String`) so the ordered size is
     recorded.
   - Optional: `Order.orderNumber String @unique` for the friendly code (else
     surface a slice of the cuid).
2. Rewrite the ~5 `src/lib/catalog.ts` bodies + `revalidateCart` +
   `place-order.ts` TODO seams as Prisma queries.
3. Swap cart-thumbnail image URLs from `/public` to Supabase Storage public URLs
   in the seed → real product rows; run `prisma db seed` from the seed file.
4. Add `loading.tsx` skeletons everywhere data is fetched (listing already has
   one).
5. Add Playwright E2E for the cart → checkout → confirmation happy path.

---

## 11. Placeholder inventory → `PLACEHOLDER_DATA.md`

Created at build time, listing every fabricated value for the client to replace:
prices per product, size-chart numbers, Our Story prose, care instructions,
delivery window, country/market default, social + legal URLs, contact details.
