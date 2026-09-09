# Zella

Storefront for Zella — relaxed-fit cotton shirts and trousers. Next.js 16 (App
Router) · React 19 · TypeScript · Tailwind v4 · Motion · Prisma (Postgres) ·
Supabase.

## Getting started

Requires **Node ≥ 22.12** (Prisma 7).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest unit tests
npm run build      # production build
npm run lint
```

## Environment

Copy the keys into `.env` (git-ignored):

```
DATABASE_URL=              # pooled Postgres connection
DIRECT_URL=                # direct (non-pooled) — migrations only
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # admin image uploads only
```

The **storefront runs without any env** — it reads an in-repo seed catalog
(`src/data/catalog.seed.ts`) through `src/lib/catalog.ts`. Only `/admin` needs
Supabase + Postgres.

## Structure

| Path | What |
|---|---|
| `src/app/page.tsx` | Home — `Hero` + `CategoryRows` |
| `src/app/shirts`, `trousers`, `bundles` | Category listing (`?sort=new\|price-asc\|price-desc`) |
| `src/app/products/[slug]` | Product detail (SSG per slug) |
| `src/app/cart`, `checkout`, `checkout/confirmation` | Guest cart → single-page COD checkout |
| `src/app/our-story`, `lookbook`, `size-guide`, `search` | Supporting pages |
| `src/app/admin/*` | Admin dashboard (Supabase auth, needs env) |
| `src/data/catalog.seed.ts` | Seed products + per-size variant stock — **swap point for the DB** |
| `src/lib/catalog.ts` | Async data-access; today reads the seed, tomorrow Prisma (same signatures) |
| `src/lib/cart/` | `localStorage` guest cart (`useCart`) + `cart-ui` drawer context |
| `src/app/actions/` | `revalidateCart`, `placeOrder` — server actions with `// TODO(db):` seams |
| `docs/superpowers/` | Design spec + implementation plan |
| `PLACEHOLDER_DATA.md` | Every fabricated value (prices, sizing, copy) to replace before launch |
| `DESIGN.md` | The "Coquette Dream Board" design system |

## Going to a real database

The seed layer was designed for a mechanical swap. When Supabase access lands:

1. Add `ProductVariant` (`product` + `size` + `stock`) and a `size` on `OrderItem`
   to `prisma/schema.prisma`; run migrations.
2. Rewrite the ~5 function bodies in `src/lib/catalog.ts` plus the `// TODO(db):`
   blocks in `revalidate-cart.ts` and `place-order.ts` as Prisma queries.
3. Seed real product rows + Supabase Storage image URLs from `catalog.seed.ts`.
4. Add Playwright E2E for the cart → checkout → confirmation path.

See `docs/superpowers/specs/2026-09-07-storefront-frontend-design.md` §10.
