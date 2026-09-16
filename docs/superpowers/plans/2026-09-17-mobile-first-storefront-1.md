# Mobile-First Responsive Pass — storefront-1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page and shared component of `apps/storefront-1` (Coquette Dream Board) genuinely mobile-first across phone/tablet/laptop — fixing real touch-target and layout defects — without changing any content, navigation pattern, or behavior.

**Architecture:** storefront-1 is Tailwind v4, which is inherently mobile-first (unprefixed classes are the phone-width base; `sm:`/`md:`/`lg:` are progressive enhancements upward). No CSS architecture change is needed here — this is an audit-and-fix pass: find real violations of the touch-target rule and any missed responsive coverage, fix them with Tailwind classes, verify structurally.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-17-mobile-first-responsive-design.md`

## Global Constraints

- Breakpoint scale: **xs** < 480px, **s** 480–767px, **m** 768–1023px, **l** ≥ 1024px. Maps onto Tailwind's built-in `sm`(640)/`md`(768)/`lg`(1024) — use those prefixes, no `tailwind.config` changes.
- **Touch-target law**: every tappable control needs a minimum 44×44px hit area (Tailwind `h-11 w-11` = 44px, or equivalent padding around text/icon content). This applies on every breakpoint, not just narrow ones — a control that's too small on a laptop trackpad is still too small on a phone with a mouse-connected hybrid device.
- **Fluid typography**: where a heading/type element uses a fixed px size that visibly clips or overflows at `xs`, convert to `clamp()` or an existing Tailwind responsive text-size stack. Only touch what's actually broken — don't rewrite type that already scales fine.
- **No content, navigation, or behavior changes.** Every fix is CSS/className only.
- Build + lint + full test suite (`npm run build`, `npm run lint`, `npm run test` at repo root, scoped to `--workspace=@zella/storefront-1` where applicable, plus the shared `@zella/core` suite) must stay green after every task.
- Commit after each task; push to `fork` only, never `origin` (see repo's established convention — `git push fork main`).

---

### Task 1: Fix the six confirmed touch-target violations

These were found via a live grep audit this session — they are real, not hypothetical.

**Files:**
- Modify: `apps/storefront-1/src/components/CartDrawer.tsx:28`
- Modify: `apps/storefront-1/src/components/CartLineItem.tsx:84-105` (decrease button) and `:96-117` (increase button)
- Modify: `apps/storefront-1/src/components/ProductDetail.tsx:289-294`
- Modify: `apps/storefront-1/src/components/SiteFooter.tsx:44-51` (Instagram) and `:52-59` (TikTok)
- Modify: `apps/storefront-1/src/components/SiteHeader.tsx:79-87`
- Modify: `apps/storefront-1/src/components/CategoryListing.tsx` (sort pills, `SORTS.map` block)

**Interfaces:** None — pure className edits, no prop/signature changes to any component.

- [ ] **Step 1: Confirm the violations (pre-fix check)**

Run:
```bash
cd /c/Users/ajmal/Junaid/officialzella
grep -n "h-10 w-10\|h-9 w-9" apps/storefront-1/src/components/CartDrawer.tsx apps/storefront-1/src/components/ProductDetail.tsx apps/storefront-1/src/components/SiteFooter.tsx apps/storefront-1/src/components/SiteHeader.tsx
grep -n "h-8 w-8" apps/storefront-1/src/components/CartLineItem.tsx
grep -n "px-3.5 py-1.5" apps/storefront-1/src/components/CategoryListing.tsx
```
Expected: all six matches print (confirms each violation is still present before the fix).

- [ ] **Step 2: Fix CartDrawer's close button**

In `apps/storefront-1/src/components/CartDrawer.tsx`, change:
```tsx
className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
```
to:
```tsx
className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
```

- [ ] **Step 3: Fix CartLineItem's qty stepper buttons**

In `apps/storefront-1/src/components/CartLineItem.tsx`, both occurrences of:
```tsx
className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 disabled:opacity-40 hover:text-cherry"
```
and
```tsx
className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 hover:text-cherry"
```
become `h-11 w-11` in place of `h-8 w-8`. Since these two buttons sit inside a `flex items-center rounded-full bg-surface-warm` pill next to a `w-7` quantity label, also widen that wrapping pill's implicit height — no explicit height is set on the pill itself, so it will grow to fit the new `h-11` children automatically; no further change needed there.

- [ ] **Step 4: Fix ProductDetail's size-guide close button**

In `apps/storefront-1/src/components/ProductDetail.tsx`, change:
```tsx
className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
```
to `h-11 w-11` in place of `h-10 w-10`.

- [ ] **Step 5: Fix SiteFooter's social icon buttons**

In `apps/storefront-1/src/components/SiteFooter.tsx`, both the Instagram and TikTok `<a>` tags currently use:
```tsx
className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-foreground/80 transition-colors hover:bg-cherry hover:text-surface"
```
change `h-10 w-10` to `h-11 w-11` in both.

- [ ] **Step 6: Fix SiteHeader's search-close button**

In `apps/storefront-1/src/components/SiteHeader.tsx`, change:
```tsx
className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-surface-warm hover:text-cherry"
```
to `h-11 w-11` in place of `h-9 w-9`. Since this button sits next to the `h-11 w-11` bag button and `h-11 w-11` menu button in the same header row, this also makes all three header icon buttons a consistent size (they were previously mismatched at 36/44/44px).

- [ ] **Step 7: Fix CategoryListing's sort pills**

In `apps/storefront-1/src/components/CategoryListing.tsx`, the `Link` inside the `SORTS.map` block currently has:
```tsx
className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
```
Change `px-3.5 py-1.5` to `px-3.5 py-1.5 min-h-11 flex items-center` so the pill's visible padding stays the same (preserving the current compact look) while its actual hit area grows to 44px tall via `min-h-11` and the text stays vertically centered via `flex items-center`. Read the surrounding lines first (`sed -n '55,75p' apps/storefront-1/src/components/CategoryListing.tsx`) to get the exact current template-literal string before editing, since the closing backtick and ternary continue past this line.

- [ ] **Step 8: Re-run the pre-fix check to confirm all six are gone**

Run the same grep commands from Step 1. Expected: no output (zero matches) for all six.

- [ ] **Step 9: Build, lint, test**

Run:
```bash
cd /c/Users/ajmal/Junaid/officialzella
npm run build --workspace=@zella/storefront-1
npm run lint --workspace=@zella/storefront-1
npm run test --workspaces --if-present
```
Expected: build succeeds, lint has zero output, all test files pass (72 tests as of this plan's writing — the count may have grown; the point is zero failures).

- [ ] **Step 10: Commit**

```bash
git add apps/storefront-1/src/components/CartDrawer.tsx apps/storefront-1/src/components/CartLineItem.tsx apps/storefront-1/src/components/ProductDetail.tsx apps/storefront-1/src/components/SiteFooter.tsx apps/storefront-1/src/components/SiteHeader.tsx apps/storefront-1/src/components/CategoryListing.tsx
git commit -m "fix: bump storefront-1 touch targets to 44px minimum (Fitts's Law / WCAG 2.5.5)"
```

---

### Task 2: Audit and fix the remaining, not-yet-checked pages and components

Everything touched heavily this session (Hero, CategoryRows, ProductDetail's grid, PairBuilder, ProductGrid, CheckoutForm's field grids, SiteFooter's column grid, CategorySkeleton) was already confirmed responsive via grep in the design phase. This task covers what wasn't yet checked: standalone pages with their own layout, and a handful of smaller shared components.

**Files to audit (read each, then fix what the checks below find):**
- `apps/storefront-1/src/app/search/page.tsx`
- `apps/storefront-1/src/app/lookbook/page.tsx`
- `apps/storefront-1/src/app/our-story/page.tsx`
- `apps/storefront-1/src/app/size-guide/page.tsx`
- `apps/storefront-1/src/app/account/page.tsx`
- `apps/storefront-1/src/app/account/login/page.tsx`
- `apps/storefront-1/src/components/SizeGuideContent.tsx`
- `apps/storefront-1/src/components/SearchField.tsx`
- `apps/storefront-1/src/components/Drawer.tsx`
- `apps/storefront-1/src/components/EmptyState.tsx`
- `apps/storefront-1/src/components/StickerBadge.tsx`

**Interfaces:** None — same as Task 1, className-only edits expected. If a file needs a structural change beyond className (unlikely, but possible if e.g. a table-like layout appears), stop and treat it as a new task rather than improvising here.

- [ ] **Step 1: Run the touch-target grep across the whole app once more, broadly**

```bash
cd /c/Users/ajmal/Junaid/officialzella
grep -rn "h-[6-9] w-[6-9]\b" apps/storefront-1/src --include="*.tsx" | grep -v "text-\|icon\|swatch\|coin\|<span"
```
This catches any `h-6` through `h-9` paired with a matching width on an actual interactive element (buttons/links), filtering out decorative spans/icons/swatches by name heuristics. Read each remaining hit; if it wraps an `onClick`, a `<button`, or a `<Link`/`<a>` with `href`, it's a real violation — apply the same `h-11 w-11` fix pattern as Task 1. If it's decorative (a badge, a coin charm, a color swatch with no click handler), leave it — decorative elements don't need a hit target.

- [ ] **Step 2: Run the missing-responsive-grid grep**

```bash
grep -rn "grid-cols-[3-9]\b" apps/storefront-1/src --include="*.tsx" | grep -v "sm:grid-cols\|md:grid-cols\|lg:grid-cols\|xl:grid-cols"
```
This finds any grid that jumps straight to 3+ columns with no responsive prefix anywhere on the same line. For each hit: read the surrounding component, confirm whether that many columns actually renders at `xs` width (375px) without cramming — if the grid items are simple color swatches or thumbnails narrower than ~110px each at 3 columns, it can stay; if items are cards with text (like a product card), add an `sm:` (or `md:`) prefix so the base (unprefixed) class becomes a lower column count and the higher count only applies from `sm`/`md` up. Follow the exact pattern already used in `ProductGrid.tsx` (`grid-cols-2 ... sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4`) for consistency.

- [ ] **Step 3: Check small-text tap targets on links/buttons**

```bash
grep -rn "text-xs.*px-2\b\|text-xs.*py-1\b" apps/storefront-1/src --include="*.tsx"
```
For each hit inside a `<Link>`, `<button>`, or `<a>`: if there's no `min-h-11` (or equivalent already-tall wrapping element) making the real hit area 44px, add `min-h-11 flex items-center` the same way as Task 1 Step 7 — matching visible padding, growing only the invisible hit area.

- [ ] **Step 4: Check fixed-width containers that could overflow at 375px**

```bash
grep -rn 'w-\[[0-9]\+px\]\|min-w-\[[0-9]\+px\]' apps/storefront-1/src --include="*.tsx"
```
For any hit where the pixel value is ≥ 375: this will force horizontal scroll on the smallest phones in the `xs` band. Wrap it in (or convert it to) a responsive value — e.g. `w-full sm:w-[<value>px]` — so it's fluid below `sm` and fixed-width from `sm` up, matching the existing pattern used for Hero's Polaroid photos (percentage-based, not fixed-px).

- [ ] **Step 5: Check for fixed-px headline/type sizes that don't scale (the fluid-typography rule)**

```bash
grep -rn "text-\[[0-9]\+px\]" apps/storefront-1/src --include="*.tsx"
```
Most headlines in this app already use Tailwind's responsive text-size stack (e.g. `text-4xl sm:text-6xl lg:text-7xl`) or an inline `clamp()` (e.g. Hero's `text-[13vw] sm:text-6xl lg:text-7xl`), which both already satisfy the fluid-typography rule — those are fine as-is, don't touch them. Only a bare fixed pixel size with **no** responsive Tailwind prefix anywhere on the same className, on an element whose text visibly needs to shrink to fit at 375px (a heading or a long single-line label — not small fixed-size UI chrome like a badge's `text-[10px]` tag, which is intentionally constant), is a real violation. For each real one found: replace it with the same `text-<size> sm:text-<bigger>` stack pattern used elsewhere in the app, sized so the smallest step fits comfortably at 375px.

- [ ] **Step 6: Read each of the eleven files listed above and fix anything the five checks above surfaced in them.**

Apply fixes directly in the files; there is no separate "test" step per fix since these are the same class of change as Task 1 (className-only). Re-run all five grep commands from Steps 1–5 after fixing to confirm each is clean (zero remaining real violations — decorative/acceptable hits from Steps 1, 2, and 5 are fine to keep).

- [ ] **Step 7: Build, lint, test**

Run the same three commands as Task 1 Step 9. Expected: same — build succeeds, lint clean, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add apps/storefront-1/src
git commit -m "fix: close remaining storefront-1 mobile-responsive gaps (touch targets, grid columns, overflow)"
```

---

### Task 3: Push, deploy, and hand off for the user's phone/laptop spot-check

**Files:** none (deploy-only task).

- [ ] **Step 1: Push to the fork**

```bash
cd /c/Users/ajmal/Junaid/officialzella
git push fork main
```
Never push to `origin` (`HasanMal1k/officialzella`) — only `fork` (`Ajma1/officialzella`), per this repo's established, non-negotiable rule.

- [ ] **Step 2: Confirm auto-deploy picked it up**

```bash
vercel project ls
```
Expected: `storefront-1`'s "Updated" column shows a very recent time (well under a minute if run right after the push completes, once Vercel's build finishes).

- [ ] **Step 3: Hand off to the user**

Tell the user storefront-1's mobile-first pass is live, and ask them to check the real site (`https://storefront-1-ajmals-projects-648d0d21.vercel.app`, or wherever the A/B gateway sends variant A) on their own phone and laptop, per the spec's verification workflow. Do not proceed to the storefront-2 plan until they respond — either with specific issues to fix (one fix round, then re-deploy and re-ask), or with approval to move on.
