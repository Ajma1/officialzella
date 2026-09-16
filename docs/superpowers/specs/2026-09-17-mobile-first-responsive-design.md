# Mobile-first responsive pass — design

**Status:** approved, ready for implementation plan
**Scope:** `apps/storefront-1`, `apps/storefront-2`, `apps/admin`, in that order

## Why

Most real traffic arrives via Instagram and WhatsApp in-app browsers — i.e.
phones. The three apps were built with a laptop-first mental model and have
had, at best, ad-hoc responsive fixes (see the `.grid-hero`/`.grid-split`
patch from 2026-09-16, which was a stopgap, not a systematic pass). This spec
makes every app genuinely mobile-first across phone/tablet/laptop, without
changing what any page says or does.

## Explicit non-goals

- No navigation-pattern changes (no hamburger/bottom-bar redesign), no content
  reordering, no new mobile-only components. This is a **responsive-CSS
  pass**: existing layout, copy, and behavior stay as-is; only how they adapt
  across viewport width changes.
- No visual-identity unification between storefront-1 (Coquette Dream Board)
  and storefront-2 (Classical) — they stay deliberately distinct for the A/B
  test. Each becomes independently mobile-first in its own visual language.
- No new browser/screenshot tooling dependency. Verification is structural
  (code, computed CSS, rendered HTML) on my side, plus the user's own
  phone/laptop spot-check per app before moving to the next one.

## The design law

**Mobile-First Responsive Design** (Luke Wroblewski): author styles for the
smallest viewport first, then progressively enhance upward via `min-width`
media queries — never the reverse. Two supporting rules ride along with it:

1. **Touch-target law** (Fitts's Law / WCAG 2.5.5): every tappable control
   gets a minimum 44×44px hit area on touch viewports. Padding may create the
   hit area even if the visible glyph/icon is smaller.
2. **Fluid typography**: headings and other size-sensitive type scale
   continuously via `clamp()` across the viewport range, not in jumps at
   breakpoints. Already the convention for big headlines in both storefronts;
   apply it wherever a fixed px size still visibly breaks at either extreme.

## Breakpoint scale (shared across all three apps)

| Name | Range        | Represents                                   |
|------|---------------|-----------------------------------------------|
| xs   | < 480px       | Phones (the Instagram/WhatsApp browser case)  |
| s    | 480–767px     | Large phones / small tablets, portrait        |
| m    | 768–1023px    | iPads / tablets                               |
| l    | ≥ 1024px      | Laptops and desktops                          |

- **storefront-1 / admin** (Tailwind v4): this scale maps directly onto
  Tailwind's built-in `sm`(640)/`md`(768)/`lg`(1024) breakpoints. Tailwind's
  unprefixed classes are already the mobile-first base — no config change
  needed, just consistent, audited use of the prefixes.
- **storefront-2** (plain CSS, no Tailwind): define the scale as real
  `min-width` breakpoints in `globals.css` — replacing the desktop-first +
  `max-width` override pattern shipped as a stopgap on 2026-09-16 with true
  mobile-first authoring (phone styles as the unqualified base rule; `s`/`m`/`l`
  layer up via `min-width`).

## Per-app plan

Same process each time: audit every page and shared component against the
four breakpoints; fix real defects; leave content/nav/behavior untouched;
build + lint + test; commit + push; user spot-checks the live deploy on their
own phone and laptop; then move to the next app.

### 1. storefront-1 (Coquette Dream Board)

Already Tailwind-authored mobile-first by convention, so this is an audit +
gap-fix pass, not a rewrite. Check:
- Every page (`/`, `/shirts`, `/trousers`, `/bundles`, `/products/[slug]`,
  `/cart`, `/checkout`, `/checkout/confirmation`, `/account*`, `/our-story`,
  `/lookbook`, `/size-guide`, `/search`) at all four breakpoints.
- Shared components: `SiteHeader`, `SiteFooter`, `CartDrawer`, `Ticker`,
  `Hero`, `CategoryRows`, `ProductDetail`, `CheckoutForm`, `OrderSummary`.
- Touch targets on custom controls: size pickers, qty steppers, `SiteButton`,
  icon-only buttons in the header/drawer.
- Any fixed-px layout that doesn't already have a Tailwind responsive
  variant covering `xs`.

### 2. storefront-2 (Classical)

The bigger lift: re-author `globals.css`'s breakpoint strategy from
desktop-first-with-override to true mobile-first, across every page — not
just the five (`/`, `/cart`, `/checkout`, `/products/[slug]`, footer,
pair-builder) already touched in the 2026-09-16 stopgap. Check:
- Every page (`/`, `/shirts`, `/trousers`, `/pair`, `/products/[slug]`,
  `/cart`, `/checkout`, `/checkout/confirmation`, `/account*`, `/our-story`,
  `/lookbook`, `/size-guide`, `/search`).
- Shared components: `SiteHeader`/nav, `SiteFooter`, `ProductCard`,
  `ProductPlate`, `ProductBuyBox`, `CartLine`, `CheckoutForm`, `PairBuilder`.
- Touch targets: cart qty buttons and other small icon/text buttons are
  visibly under 44px today.
- Replace the `.grid-hero`/`.grid-split`/`.grid-pdp`/`.grid-2`/`.grid-footer`
  max-width overrides with mobile-first equivalents (base = single column /
  stacked, `min-width` queries introduce the multi-column layout at `m`/`l`).

### 3. admin (internal tool)

No responsive treatment exists today. Check:
- Dashboard, product list/form, order list/detail, inventory pages.
- Tables (products, orders, inventory) are the highest-risk case on phones —
  default to a stacked card layout below `s` rather than horizontal scroll,
  unless a given table is simple enough to just shrink cleanly.
- Login form and any modal/drawer-style UI for touch-target sizing.

## Verification

1. Build + lint + full test suite pass for the touched app.
2. Structural check on my side: rendered HTML/computed CSS confirms no
   fixed-px element wider than the `xs` band, and media-query coverage exists
   for the four bands.
3. Commit + push to the fork; auto-deploy picks it up.
4. User checks the live deploy on their own phone and laptop; reports
   anything still off.
5. One fix round per round of feedback — not an open-ended polish loop —
   then move to the next app.

## Out of scope for this spec (noted, not actioned)

- storefront-2's missing favicon (pre-existing, unrelated).
- Any A/B split, deployment-protection, or landing-page-content work — all
  already done in prior sessions; this spec is responsive CSS only.
