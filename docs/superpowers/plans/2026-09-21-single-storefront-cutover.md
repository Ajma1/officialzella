# Single Storefront Cutover + Instant Reflection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `storefront-2` the single public site at `officialzella.com` (retiring the A/B split), and make its catalog pages render fresh on every request so admin edits show up immediately — no rebuild required.

**Architecture:** Move the two production domains from the `storefront-1` Vercel project to `storefront-2`, delete storefront-1's A/B proxy (the only thing that made it a gateway), close storefront-2's four content/SEO gaps left over from it never having been the public site, and flip storefront-2's root layout to `force-dynamic` so every catalog read hits Postgres directly instead of a build-time snapshot. `storefront-1` stays deployed at its `.vercel.app` alias, untouched otherwise.

**Tech Stack:** Next.js 16 App Router, Vercel (MCP tools for domain moves), Prisma/Postgres (via `@zella/core/catalog`), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-21-single-storefront-admin-platform-design.md` — this plan implements Phase 1 (single storefront cutover) and Phase 2 (instant reflection). Phases 3–5 (order tooling, dashboard, feedback) get their own plans later.

## Global Constraints

- `storefront-1` is **not deleted or defunded** — it keeps deploying from `main` to `storefront-1-kohl.vercel.app`. Only its domains and its A/B proxy are removed.
- No visual/copy changes to storefront-2 beyond the four parity gaps (bundles redirect, not-found, favicon, sitemap/robots) — ship it as-is otherwise.
- `force-dynamic` goes on storefront-2's root layout only — not storefront-1, not admin (admin is already dynamic).
- Vercel team for all MCP calls: `team_FNXDRQmNqxqAQC59LcBw34Kf`. Projects: `storefront-1` = `prj_OoE4gNsMUk0u0qaU0x8kjuezO9RS`, `storefront-2` = `prj_gpJCIKv3SDlmI74HCizMM1HSzJE0`.
- `NEXT_PUBLIC_SITE_URL=https://officialzella.com` is already set on storefront-2's Production env (verified via `filter_project_envs` during planning) — no action needed for that specific item.

---

### Task 1: Add production domains to storefront-2

**Files:** none (Vercel project configuration only — no repo changes).

**Interfaces:**
- Consumes: `mcp__plugin_vercel_vercel__add_project_domain` tool, project id `prj_gpJCIKv3SDlmI74HCizMM1HSzJE0`, team id `team_FNXDRQmNqxqAQC59LcBw34Kf`.
- Produces: `officialzella.com` and `www.officialzella.com` resolve to storefront-2's deployment. Task 5 (removing storefront-1's proxy) depends on this landing first — until this task completes, storefront-1 is still the only thing serving those domains.

- [ ] **Step 1: Add `officialzella.com` to the storefront-2 project**

Call `mcp__plugin_vercel_vercel__add_project_domain` with:
```json
{
  "idOrName": "prj_gpJCIKv3SDlmI74HCizMM1HSzJE0",
  "teamId": "team_FNXDRQmNqxqAQC59LcBw34Kf",
  "requestBody": { "name": "officialzella.com" }
}
```
A domain can only belong to one Vercel project per team, so this call **moves** it off storefront-1 automatically — no separate "remove from storefront-1" step exists or is needed.

- [ ] **Step 2: Add `www.officialzella.com` to the storefront-2 project**

Same call with `"name": "www.officialzella.com"`.

- [ ] **Step 3: Verify both domains now list under storefront-2**

Call `mcp__plugin_vercel_vercel__list_project_domains` with `idOrName: "prj_gpJCIKv3SDlmI74HCizMM1HSzJE0"`, `teamId: "team_FNXDRQmNqxqAQC59LcBw34Kf"`.
Expected: response includes both `officialzella.com` and `www.officialzella.com` with `"verified": true`. If either shows `"verified": false`, stop and report — DNS in Cloudflare may need a look before continuing (do not proceed to Task 5 with an unverified domain, since that would leave the apex unserved).

- [ ] **Step 4: Verify storefront-1 no longer lists the apex/www domains**

Call `mcp__plugin_vercel_vercel__list_project_domains` with `idOrName: "prj_OoE4gNsMUk0u0qaU0x8kjuezO9RS"`.
Expected: only `storefront-1-kohl.vercel.app` remains.

No commit for this task — it's infrastructure state, not code.

---

### Task 2: Close storefront-2's `/bundles` gap

**Files:**
- Create: `apps/storefront-2/src/app/bundles/page.tsx`
- Test: `apps/storefront-2/src/app/bundles/__tests__/page.test.ts`

**Interfaces:**
- Consumes: `redirect` from `next/navigation`.
- Produces: nothing consumed by other tasks — this is a leaf route.

storefront-1 has (had) a `/bundles` route; storefront-2 calls the same concept `/pair` at `apps/storefront-2/src/app/pair/page.tsx`. Now that storefront-2 owns the public domain, any old external link or bookmark to `/bundles` must not 404.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/storefront-2/src/app/bundles/__tests__/page.test.ts
import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

describe("/bundles", () => {
  it("redirects to /pair", async () => {
    const { default: BundlesPage } = await import("../page");
    expect(() => BundlesPage()).toThrow("REDIRECT:/pair");
    expect(redirectMock).toHaveBeenCalledWith("/pair");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from repo root): `npm run test -w @zella/storefront-2 -- bundles`
Expected: FAIL — `Cannot find module '../page'` (the route doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```typescript
// apps/storefront-2/src/app/bundles/page.tsx
import { redirect } from "next/navigation";

export default function BundlesPage() {
  redirect("/pair");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w @zella/storefront-2 -- bundles`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront-2/src/app/bundles/
git commit -m "feat(storefront-2): redirect /bundles to /pair for parity with storefront-1's old route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Add `not-found.tsx` and favicon to storefront-2

**Files:**
- Create: `apps/storefront-2/src/app/not-found.tsx`
- Create: `apps/storefront-2/public/favicon.ico` (binary copy)

**Interfaces:**
- Consumes: none from other tasks.
- Produces: nothing consumed by other tasks.

storefront-2 currently has no custom 404 page (falls back to Next's bare default) and an empty `public/` directory (no favicon). Both are now user-facing on the canonical domain.

- [ ] **Step 1: Copy storefront-1's favicon as the starting asset**

```bash
cp apps/storefront-1/src/app/favicon.ico apps/storefront-2/public/favicon.ico
```

This is a placeholder reuse of the existing brand mark, not a design decision — flag to the user that a storefront-2-specific favicon can replace it later if wanted.

- [ ] **Step 2: Write the not-found page, matching storefront-2's existing "Classical" component patterns**

Match the structure already used in `apps/storefront-2/src/app/size-guide/page.tsx` (`.container`/`.container-narrow`, `.kicker`, inline `clamp()` heading sizes) rather than storefront-1's `EmptyState`/`SiteButton` components, which don't exist in storefront-2.

```typescript
// apps/storefront-2/src/app/not-found.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found — Zella" };

export default function NotFound() {
  return (
    <section className="container-narrow" style={{ padding: "96px 28px 120px", textAlign: "center" }}>
      <p className="kicker">404</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 14px" }}>
        This page wandered off.
      </h1>
      <p style={{ maxWidth: "44ch", margin: "0 auto 32px", fontSize: 15, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist — let&rsquo;s get you back to the edit.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </section>
  );
}
```

No test — this is a static server component with no branching logic (matches the codebase's existing pattern of not unit-testing simple presentational pages; see `size-guide/page.tsx`, which has no test file either).

- [ ] **Step 3: Commit**

```bash
git add apps/storefront-2/src/app/not-found.tsx apps/storefront-2/public/favicon.ico
git commit -m "feat(storefront-2): add not-found page and favicon for canonical domain

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Add `sitemap.ts` and `robots.ts` to storefront-2

**Files:**
- Create: `apps/storefront-2/src/app/sitemap.ts`
- Create: `apps/storefront-2/src/app/robots.ts`
- Test: `apps/storefront-2/src/app/__tests__/sitemap.test.ts`

**Interfaces:**
- Consumes: `getAllProducts` from `@zella/core/catalog` (already used elsewhere in storefront-2, e.g. `page.tsx`); `MetadataRoute` type from `next`.
- Produces: nothing consumed by other tasks.

storefront-2 is now the canonically indexed site and has neither file. Next's App Router supports these as native metadata route files — no library needed.

- [ ] **Step 1: Write the failing test for sitemap**

```typescript
// apps/storefront-2/src/app/__tests__/sitemap.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@zella/core/catalog", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    { slug: "test-shirt", updatedAt: undefined },
  ]),
}));

describe("sitemap", () => {
  it("includes static routes and every product slug", async () => {
    const { default: sitemap } = await import("../sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://officialzella.com");
    expect(urls).toContain("https://officialzella.com/shirts");
    expect(urls).toContain("https://officialzella.com/trousers");
    expect(urls).toContain("https://officialzella.com/pair");
    expect(urls).toContain("https://officialzella.com/products/test-shirt");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w @zella/storefront-2 -- sitemap`
Expected: FAIL — `Cannot find module '../sitemap'`.

- [ ] **Step 3: Write minimal sitemap implementation**

```typescript
// apps/storefront-2/src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllProducts } from "@zella/core/catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officialzella.com";

const STATIC_ROUTES = [
  "",
  "/shirts",
  "/trousers",
  "/pair",
  "/our-story",
  "/lookbook",
  "/size-guide",
  "/feedback",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
  }));

  return [...staticEntries, ...productEntries];
}
```

Note: `/feedback` is listed here even though it doesn't exist yet (it's Phase 5) — harmless forward reference, and cheaper than remembering to add it later. If Phase 5 changes the route name, update this list then.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w @zella/storefront-2 -- sitemap`
Expected: PASS.

- [ ] **Step 5: Write robots.ts (no test — static config, no branching)**

```typescript
// apps/storefront-2/src/app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officialzella.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/storefront-2/src/app/sitemap.ts apps/storefront-2/src/app/robots.ts apps/storefront-2/src/app/__tests__/
git commit -m "feat(storefront-2): add sitemap.ts and robots.ts for canonical domain

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Remove storefront-1's A/B proxy

**Files:**
- Delete: `apps/storefront-1/src/proxy.ts`

**Interfaces:**
- Consumes: none.
- Produces: none. This is a deletion-only task.

**Do not start this task until Task 1 is verified complete** (domains confirmed live on storefront-2) — deleting the proxy first would leave a window where storefront-1 still owns the domains but no longer knows how to split traffic to storefront-2, silently showing 100% storefront-1 to production visitors instead of the intended split. Order matters here specifically because Task 1 is infra state (not gated by CI) and this task is a code change — verify the infra landed before deleting the code that depended on it.

- [ ] **Step 1: Confirm Task 1's domain move is live**

Re-run `mcp__plugin_vercel_vercel__list_project_domains` for `prj_OoE4gNsMUk0u0qaU0x8kjuezO9RS` (storefront-1) and confirm it no longer lists `officialzella.com` / `www.officialzella.com`. If it still does, stop — Task 1 hasn't fully landed.

- [ ] **Step 2: Delete the proxy file**

```bash
rm apps/storefront-1/src/proxy.ts
```

There is no test to update — `apps/storefront-1` has no test file referencing `proxy.ts` (confirmed via repo search during planning; the A/B split's cookie/rewrite logic was never unit-tested, only documented in the file's own comments).

- [ ] **Step 3: Confirm storefront-1 still builds without it**

Run: `npm run build -w @zella/storefront-1`
Expected: build succeeds — Next.js treats `proxy.ts`/`middleware.ts` as fully optional; its absence is not an error.

- [ ] **Step 4: Commit**

```bash
git add -u apps/storefront-1/src/proxy.ts
git commit -m "refactor(storefront-1): remove A/B split proxy now that storefront-2 owns the public domain

storefront-1 stays deployed at storefront-1-kohl.vercel.app but no longer
gateways traffic — the sticky 50/50 test is over, storefront-2 won.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Make storefront-2's catalog reads request-time (instant reflection)

**Files:**
- Modify: `apps/storefront-2/src/app/layout.tsx`
- Test: manual verification only (see Step 3) — this is a Next.js rendering-mode change, not a function whose return value a unit test can meaningfully assert on. The spec calls this out explicitly (Phase 2 testing note).

**Interfaces:**
- Consumes: none.
- Produces: every storefront-2 route becomes request-time rendered (route segment config cascades from the root layout down). No other task depends on this directly, but Phase 3/4/5 (future plans) assume this is already in place — admin writes will already be visible live once those phases ship.

- [ ] **Step 1: Add the `dynamic` export to the root layout**

Read the current file first (it was inspected during planning — `apps/storefront-2/src/app/layout.tsx` starts with the font/metadata imports shown below). Add one export near the top, right after the `Metadata` export, with a `ponytail:` comment documenting the upgrade path:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Zella — Loose cotton, cut for the way you move",
  description:
    "Button-down shirts and wide-leg trousers, woven to breathe and cut with room to move.",
};

// ponytail: force-dynamic means every request hits Postgres for the catalog
// read — fine at current traffic, and the only way admin edits show up
// without a rebuild (two separate Vercel projects can't share a build-time
// cache). If/when traffic makes this measurably slow, upgrade to
// `"use cache"` + `cacheTag("catalog")` on packages/core/src/catalog.ts's
// functions, plus a secret-signed revalidate webhook admin calls after
// every product/inventory write.
export const dynamic = "force-dynamic";
```

(Insert this after the existing `metadata` export and before the default `RootLayout` component — the exact surrounding code was confirmed during planning; do not reformat unrelated parts of the file.)

- [ ] **Step 2: Run the existing test suite to confirm nothing else broke**

Run: `npm run test -w @zella/storefront-2`
Expected: PASS (this change affects Next's rendering mode, not any function these tests call directly — `passWithNoTests: true` in the vitest config means this may currently report zero or few tests; either way, nothing should fail).

- [ ] **Step 3: Manual verification (do this after deploying, not before)**

This step happens post-deploy, once Tasks 1–6 are all merged and Vercel has redeployed storefront-2:
1. In `admin.officialzella.com`, edit an existing product's name (or stock count).
2. Immediately load the corresponding page on `officialzella.com` (hard refresh, no cache bypass tricks needed).
3. Expected: the change is visible on that load — no wait, no redeploy.

Record the result back to the user in this session or the next one; this is the acceptance check for Phase 2's entire premise.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront-2/src/app/layout.tsx
git commit -m "fix(storefront-2): force dynamic rendering so admin catalog edits reflect instantly

Storefront pages were statically prerendered at build time, so admin's
revalidatePath() calls (which only reach admin's own Vercel project) could
never make a new product or stock change visible without a redeploy.
force-dynamic makes every catalog read hit Postgres per-request instead.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Push and confirm production deploy

**Files:** none.

**Interfaces:**
- Consumes: all prior tasks' commits.
- Produces: live production state matching this plan.

- [ ] **Step 1: Push the branch / merge to `main`**

Follow the repo's existing convention (this repo pushes to `fork` → `Ajma1/officialzella`, the fork remote, per the project's recorded connection state; confirm current branch and remote setup with `git status -sb` and `git remote -v` before pushing, since these may have changed since last recorded).

- [ ] **Step 2: Confirm storefront-2's Vercel deployment succeeded**

Call `mcp__plugin_vercel_vercel__list_deployments` for `prj_gpJCIKv3SDlmI74HCizMM1HSzJE0`, `teamId: team_FNXDRQmNqxqAQC59LcBw34Kf`, and check the latest production deployment's `readyState` is `READY`.

- [ ] **Step 3: Load `https://officialzella.com` and spot-check**

Confirm: homepage loads storefront-2's "Classical" design (not storefront-1's), `/bundles` redirects to `/pair`, a deliberately-broken URL shows the new not-found page, `/sitemap.xml` and `/robots.txt` both resolve.

- [ ] **Step 4: Run Task 6 Step 3's manual admin-edit verification**

If not already done, do it now — this is the acceptance test for the whole plan.

No commit for this task — verification only.
