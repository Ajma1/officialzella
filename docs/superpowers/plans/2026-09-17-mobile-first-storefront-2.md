# Mobile-First Responsive Pass — storefront-2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page and shared component of `apps/storefront-2` (Classical) genuinely mobile-first across phone/tablet/laptop — fixing real touch-target violations, adding a working mobile nav, and re-authoring the breakpoint CSS to be truly mobile-first (base = phone, `min-width` layers up) — without changing any content or behavior beyond the one approved nav-pattern exception.

**Architecture:** storefront-2 uses plain CSS (no Tailwind) with a small set of shared classes (`.btn`, `.input`, `.grid-*`) in `globals.css` plus heavy per-component inline `style={{}}`. Unlike storefront-1, most interactive elements share the `.btn`/`.input` base classes — this means the highest-leverage fixes are two one-line CSS changes (Task 1), not dozens of component edits. The breakpoint architecture (added 2026-09-16 as a stopgap) is currently desktop-first-with-`max-width`-override; this plan inverts it to genuine mobile-first `min-width` cascading (Task 4), and adds the one approved exception to the "no nav changes" rule: a mobile hamburger/panel for the header, since the header currently has zero responsive handling and overflows on every phone (Task 3).

**Tech Stack:** Next.js 16 (App Router), plain CSS custom properties (no Tailwind), TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-17-mobile-first-responsive-design.md` (see the 2026-09-17 amendment to the nav-pattern non-goal, specific to this app)

## Global Constraints

- Breakpoint scale: **xs** < 480px, **s** 480–767px, **m** 768–1023px, **l** ≥ 1024px. For this plain-CSS app, `s` = `min-width: 480px`, `m` = `min-width: 768px`, `l` = `min-width: 1024px` — author every new/changed rule mobile-first (base rule = `xs`, then layer up via `min-width`), never the desktop-first-with-`max-width`-override pattern from the 2026-09-16 stopgap.
- **Touch-target law**: every tappable control needs a minimum 44×44px hit area, on every breakpoint. Prefer fixing the shared base class (`.btn`, `.input`) over patching individual components wherever a control already uses that class — the base-class fix propagates automatically to every inline-style override that doesn't itself set `min-height`.
- **Fluid typography**: not touched in this plan — storefront-2's headings already use `clamp()` throughout; no fixed-px heading was found broken during this plan's audit.
- **The one approved nav exception**: storefront-2's `SiteHeader.tsx` may gain a hamburger + slide-out panel below the `m` breakpoint, collapsing the same 5 existing nav links (no new links, no reordering, no content change) — this is the only nav-pattern change permitted anywhere in this spec.
- **No other content, navigation, or behavior changes.**
- Build + lint + full test suite (`npm run build --workspace=@zella/storefront-2`, `npm run lint --workspace=@zella/storefront-2`, `npm run test --workspaces --if-present` at repo root) must stay green after every task.
- Commit after each task; push to `fork` only, never `origin` — `git push fork main`.
- Lesson carried forward from storefront-1's final review: don't design a discovery/verification check around one brittle regex tied to specific values. Where this plan gives a grep, treat it as a starting point, not the definition of "done" — read the surrounding code and reason about actual rendered height/width, the same way the audit that grounded this plan did.

---

### Task 1: Fix the two root-cause shared classes

These two one-line changes are the highest-leverage fix in this plan — confirmed by live audit, `.btn` renders at ≈35px tall and `.input` explicitly declares `min-height: 36px`, both under the 44px minimum, and both are the base class for the large majority of buttons/inputs across the whole app (including ones with inline `style` padding overrides, since inline styles never touch `min-height` unless they set it themselves).

**Files:**
- Modify: `apps/storefront-2/src/app/globals.css:105-120` (`.btn`) and `:136-146` (`.input`)

**Interfaces:** None — pure CSS value changes, no className or markup changes anywhere.

- [ ] **Step 1: Confirm the current values (pre-fix check)**

```bash
cd /c/Users/ajmal/Junaid/officialzella
grep -n "min-height: 36px" apps/storefront-2/src/app/globals.css
grep -n "^\.btn {" -A 15 apps/storefront-2/src/app/globals.css | grep -c "min-height"
```
Expected: the first command shows one match (`.input`'s current 36px); the second shows `0` (`.btn` has no `min-height` at all today).

- [ ] **Step 2: Add `min-height: 44px` to `.btn`**

In `apps/storefront-2/src/app/globals.css`, the `.btn` rule currently reads:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-size: 14px;
  line-height: 1.2;
  color: var(--color-text);
  background: transparent;
  border: 1px solid transparent;
  padding: var(--space-2) calc(var(--space-3) * 1.2);
  border-radius: var(--radius-md);
}
```
Add `min-height: 44px;` as a new line (position doesn't matter for a flat rule like this — add it after `gap: 6px;` for readability). Since `.btn` already has `display: inline-flex; align-items: center; justify-content: center;`, content stays centered within the taller box automatically — no other change needed.

- [ ] **Step 3: Bump `.input`'s `min-height` from 36px to 44px**

In the same file, change:
```css
.input {
  width: 100%;
  min-height: 36px;
```
to:
```css
.input {
  width: 100%;
  min-height: 44px;
```
Leave `textarea.input { min-height: 90px; ... }` (a separate, later rule) untouched — it already exceeds 44px and serves a different purpose (multi-line text entry, not a single tap target).

- [ ] **Step 4: Verify the fix propagates to inline-style overrides**

```bash
grep -n "className=\"btn" apps/storefront-2/src/components/*.tsx apps/storefront-2/src/app/**/*.tsx | grep "padding:"
```
Read every file this returns (expect to see `CartLine.tsx`, `ProductBuyBox.tsx`, `SiteHeader.tsx` among them) and confirm each button's inline `style` object sets `padding` and/or `fontSize` but never `minHeight` — if any of them DO set an explicit `minHeight` below 44px, note it and fix that one specifically (its inline style would override the class fix). Based on the audit that grounded this plan, none currently do, but confirm rather than assume.

- [ ] **Step 5: Build, lint, test**

```bash
cd /c/Users/ajmal/Junaid/officialzella
npm run build --workspace=@zella/storefront-2
npm run lint --workspace=@zella/storefront-2
npm run test --workspaces --if-present
```
Expected: build succeeds, lint clean, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront-2/src/app/globals.css
git commit -m "fix: bump storefront-2's shared .btn/.input classes to 44px minimum"
```

---

### Task 2: Fix standalone touch-target violations that Task 1 doesn't reach

These three controls don't use the `.btn` class at all — they're plain `<button>`/`<Link>` elements styled entirely via inline `style`, so Task 1's class fix doesn't help them.

**Files:**
- Modify: `apps/storefront-2/src/components/CartLine.tsx:44-52` (the "Remove" button)
- Modify: `apps/storefront-2/src/app/account/page.tsx` (the cancel-order-style button around line 73 — read the file to confirm the exact current line, it may have shifted)
- Modify: `apps/storefront-2/src/components/ProductBuyBox.tsx:71-73` (the "Size chart" link)

**Interfaces:** None — className/style-only edits.

- [ ] **Step 1: Fix CartLine.tsx's "Remove" button**

Current (around line 45-52):
```tsx
<button
  type="button"
  onClick={() => removeItem(item.productId, item.size, pairId)}
  style={{ background: "none", border: 0, padding: "0 0 0 8px", cursor: "pointer", fontSize: 12, color: "color-mix(in srgb, var(--color-text) 58%, transparent)", textDecoration: "underline" }}
>
```
Add `display: "flex", alignItems: "center", minHeight: 44,` to the style object (keep every existing property — `background`, `border`, the `padding: "0 0 0 8px"` left-padding for spacing from its sibling, `cursor`, `fontSize`, `color`, `textDecoration` all stay exactly as they are). Result:
```tsx
style={{ background: "none", border: 0, padding: "0 0 0 8px", display: "flex", alignItems: "center", minHeight: 44, cursor: "pointer", fontSize: 12, color: "color-mix(in srgb, var(--color-text) 58%, transparent)", textDecoration: "underline" }}
```

- [ ] **Step 2: Fix account/page.tsx's cancel button**

Read `apps/storefront-1/src/app/account/page.tsx`'s equivalent for reference if useful, but fix `apps/storefront-2/src/app/account/page.tsx` directly. Find the `<button type="submit" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", fontSize: 12, textDecoration: "underline", color: "var(--color-accent-800)" }}>` and apply the same treatment as Step 1: add `display: "flex", alignItems: "center", minHeight: 44,` alongside the existing properties, keeping everything else unchanged.

- [ ] **Step 3: Fix ProductBuyBox.tsx's "Size chart" link**

Current (around line 71-73):
```tsx
<Link href="/size-guide" style={{ display: "block", marginBottom: 24, fontSize: 12 }}>
  Size chart
</Link>
```
Change `display: "block"` to `display: "flex", alignItems: "center", minHeight: 44,` (keep `marginBottom: 24` and `fontSize: 12` unchanged):
```tsx
<Link href="/size-guide" style={{ display: "flex", alignItems: "center", minHeight: 44, marginBottom: 24, fontSize: 12 }}>
  Size chart
</Link>
```

- [ ] **Step 4: Build, lint, test**

Same three commands as Task 1 Step 5.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront-2/src/components/CartLine.tsx apps/storefront-2/src/app/account/page.tsx apps/storefront-2/src/components/ProductBuyBox.tsx
git commit -m "fix: close storefront-2 touch-target gaps outside the shared .btn class"
```

---

### Task 3: Add a mobile nav (the one approved nav-pattern exception)

`SiteHeader.tsx` today renders the logo, all 5 nav links, and the bag button in one unbroken flex row with zero responsive handling — confirmed by audit to overflow horizontally well past 375px. Per the spec's 2026-09-17 amendment, add a hamburger button that shows only below the `m` breakpoint (768px), toggling a slide-out panel with the same 5 links. Above `m`, nothing changes — the existing inline nav stays exactly as it renders today.

**Files:**
- Modify: `apps/storefront-2/src/components/SiteHeader.tsx` (full rewrite of the component body — same `NAV_LINKS` data, same routes, new markup/state for the mobile case)
- Modify: `apps/storefront-2/src/app/globals.css` (add the new classes this task needs)

**Interfaces:**
- Produces: no new exports — `SiteHeader` remains a default export with no props, same as today.

- [ ] **Step 1: Add the mobile-nav CSS classes**

In `apps/storefront-2/src/app/globals.css`, add this block after the existing `.grid-footer` rule (before the `@media (max-width: 760px)` block that Task 4 will also touch — order relative to that block doesn't matter, just keep it readable):

```css
/* — mobile nav (the one approved nav-pattern exception, see spec) — */
.nav-desktop {
  display: none;
}
.nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--color-text);
}
.nav-mobile-panel {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  padding: 20px 28px;
}
.nav-mobile-panel a {
  display: flex;
  align-items: center;
  min-height: 56px;
  font-family: var(--font-heading);
  font-size: 22px;
  letter-spacing: 0.04em;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-divider);
}
@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
  .nav-toggle {
    display: none;
  }
}
```

- [ ] **Step 2: Rewrite SiteHeader.tsx**

Replace the full file with:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@zella/core/cart";

const NAV_LINKS = [
  { label: "Shirts", href: "/shirts" },
  { label: "Trousers", href: "/trousers" },
  { label: "Pair", href: "/pair" },
  { label: "Our Story", href: "/our-story" },
  { label: "Account", href: "/account" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", gap: 30, padding: "15px 28px" }}
      >
        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <Link
          href="/"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 25,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "var(--color-text)",
            marginRight: "auto",
          }}
        >
          Zella
        </Link>

        <nav className="nav-desktop" style={{ gap: 24, alignItems: "center" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  paddingBottom: 4,
                  borderBottom: `1px solid ${active ? "var(--color-accent)" : "transparent"}`,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/cart" className="btn btn-secondary" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Bag {count > 0 ? `(${count})` : ""}
        </Link>
      </div>

      {menuOpen && (
        <div className="nav-mobile-panel">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button
              type="button"
              className="nav-toggle"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
```

Note what changed from the original: `NAV_LINKS` data and every route/label is byte-identical to before. The desktop `<nav>` now carries `className="nav-desktop"` instead of an inline `display: "flex"` (the class itself sets `display: flex` at `min-width: 768px` and `display: none` below it — verify this in Step 1's CSS) and keeps `gap`/`alignItems` inline since those aren't part of the show/hide toggle. A new `.nav-toggle` hamburger button appears before the logo, and a new full-screen `.nav-mobile-panel` renders when `menuOpen` is true, listing the same links, closing itself when a link is tapped (so navigating away always leaves the menu closed for next time) or when the ✕ is tapped.

- [ ] **Step 3: Verify no horizontal overflow remains — structural check**

Since there's no browser tool in this environment, verify structurally: confirm the `.nav-desktop` class only applies `display: flex` at `min-width: 768px` (re-read the CSS from Step 1), and confirm `.nav-toggle` only applies `display: none` at that same breakpoint — the two must be exact inverses of each other at every width, or there will be a range where either both or neither render. Also confirm `.nav-mobile-panel` has no width/height constraint smaller than the viewport (it uses `inset: 0`, which fills the viewport at any size).

- [ ] **Step 4: Build, lint, test**

Same three commands as Task 1 Step 5.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront-2/src/components/SiteHeader.tsx apps/storefront-2/src/app/globals.css
git commit -m "feat: add mobile nav to storefront-2's header (approved spec exception)"
```

---

### Task 4: Re-author the six grid classes as true mobile-first

These six classes (added 2026-09-16) currently declare the desktop/multi-column layout as the unconditional base rule, with a `max-width: 760px` query overriding down to one column — backwards from mobile-first. Invert them: base rule becomes one column, `min-width` queries layer the multi-column layout back on at `m` (768px) — same rendered result at every breakpoint, different (correct) authoring order.

**Files:**
- Modify: `apps/storefront-2/src/app/globals.css:179-231` (the six `.grid-*` rules plus their two existing `@media` blocks)

**Interfaces:** None — every page/component using these six classNames (`page.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `products/[slug]/page.tsx`, `SiteFooter.tsx`, `PairBuilder.tsx`) needs zero changes; only the CSS definitions move.

- [ ] **Step 1: Confirm the current CSS (pre-fix check)**

```bash
cd /c/Users/ajmal/Junaid/officialzella
sed -n '179,231p' apps/storefront-2/src/app/globals.css
```
Confirm it matches: six rules each declaring their multi-column `grid-template-columns` unconditionally, followed by `@media (max-width: 760px)` collapsing `.grid-hero`/`.grid-split`/`.grid-pdp`/`.grid-footer` to `1fr` (gap 32px) and `.grid-fabric` to `1fr` (gap 36px), followed by `@media (max-width: 480px)` collapsing `.grid-2` to `1fr`.

- [ ] **Step 2: Replace the whole block (lines 179-231) with the mobile-first version**

```css
.grid-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
.grid-fabric {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
}
/* Main content + fixed sidebar (cart, checkout, pair builder) — sidebar
   width is per-usage via --sidebar-w, default matches cart/checkout's 300px. */
.grid-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: start;
}
.grid-pdp {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: start;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.grid-footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 480px) {
  .grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 768px) {
  .grid-hero {
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
    gap: 52px;
    align-items: center;
  }
  .grid-fabric {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 30px;
  }
  .grid-split {
    grid-template-columns: minmax(0, 1fr) var(--sidebar-w, 300px);
    gap: 40px;
  }
  .grid-pdp {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 54px;
  }
  .grid-footer {
    grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr));
    gap: 36px;
  }
}
```

Note this is functionally identical to the current rendered behavior at every breakpoint (same values, same breakpoints) — only the authoring direction inverts. `.grid-products` (line 174-178, just above this block) is untouched — it already uses `repeat(auto-fill, minmax(...))`, which is inherently responsive with no breakpoint needed.

- [ ] **Step 3: Verify no other page/component broke**

```bash
grep -rln "grid-hero\|grid-fabric\|grid-split\|grid-pdp\|grid-2\|grid-footer" apps/storefront-2/src --include="*.tsx"
```
Expected: `app/page.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/products/[slug]/page.tsx`, `components/SiteFooter.tsx`, `components/PairBuilder.tsx`, `components/CheckoutForm.tsx` (the `.grid-2` for field pairs). None of these files need editing — this step is confirming the className usage is unaffected by the CSS-only rewrite, not editing them.

- [ ] **Step 4: Build, lint, test**

Same three commands as Task 1 Step 5.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront-2/src/app/globals.css
git commit -m "refactor: author storefront-2's grid breakpoints mobile-first (min-width cascade)"
```

---

### Task 5: Broader audit sweep for anything the targeted fixes missed

Task 1-4 covered every violation found during this plan's own grounding audit. This task re-sweeps the app once more, after those fixes land, using judgment rather than a narrow regex — the lesson carried forward from storefront-1's final review.

**Files to sweep (read each, fix what you find using the same patterns as Tasks 1-2 — prefer the `.btn` class if a rewrite makes sense, otherwise a targeted `display: flex; alignItems: center; minHeight: 44` style addition):**
- `apps/storefront-2/src/app/shirts/page.tsx`, `apps/storefront-2/src/app/trousers/page.tsx` (both likely delegate to `CategoryListing.tsx` — check the delegate, not just the thin page)
- `apps/storefront-2/src/components/CategoryListing.tsx`
- `apps/storefront-2/src/components/ProductCard.tsx`, `apps/storefront-2/src/components/ProductPlate.tsx`
- `apps/storefront-2/src/components/PairBuilder.tsx`
- `apps/storefront-2/src/components/CheckoutForm.tsx`
- `apps/storefront-2/src/app/checkout/confirmation/page.tsx`
- `apps/storefront-2/src/app/account/login/page.tsx`
- `apps/storefront-2/src/app/our-story/page.tsx`, `apps/storefront-2/src/app/lookbook/page.tsx`, `apps/storefront-2/src/app/size-guide/page.tsx` (confirmed content-only during this plan's audit — no interactive elements — but re-confirm rather than trust that finding blindly, since it was a quick pass)

**Interfaces:** None expected — same class of fix as Tasks 1-2. If a genuinely new judgment call arises (something that isn't a simple className/style tweak), stop and report rather than improvising.

- [ ] **Step 1: For every `<button>`, `<Link href=`, and `<a href=` in the files above, compute (don't guess) its rendered height**

For each one: read its className and inline style. If it uses `.btn` with no `minHeight` override, it's already fixed by Task 1 — skip it. If it's a plain element, add up: `line-height × font-size` (line-height defaults to roughly 1.2–1.5× the font-size unless the element or an ancestor sets one explicitly — check for a `lineHeight` in the style or a CSS rule) plus top+bottom padding (if the style sets `padding: "Ny Nx"` shorthand, the first number is vertical). If that total is under 44px, it's a real violation — fix it with `display: "flex", alignItems: "center", minHeight: 44` added to its existing style object (or className, if it already carries one that makes sense to extend), exactly as done in Task 2. If the element's real hit area is already large for a non-text reason (e.g. it's a `Link` wrapping a full product photo, the way `ProductCard.tsx`/`PairBuilder.tsx`'s picker buttons do), leave it — that's not a violation, matching the "decorative/acceptable" judgment call already made during storefront-1's equivalent audit.

- [ ] **Step 2: Re-run Task 1's propagation check once more, broadly**

```bash
grep -rn "minHeight: [0-3][0-9]\b\|minHeight: \"[0-3][0-9]" apps/storefront-2/src --include="*.tsx"
```
This catches any inline `minHeight` (from this task's own fixes, or pre-existing) set below 40px, which would silently override Task 1's class-level fix. Fix any real hit found the same way.

- [ ] **Step 3: Build, lint, test**

Same three commands as Task 1 Step 5.

- [ ] **Step 4: Commit** (only if Step 1 or 2 found and fixed something — if the sweep found nothing beyond what Tasks 1-4 already covered, report that and skip the commit; don't create an empty commit)

```bash
git add apps/storefront-2/src
git commit -m "fix: close remaining storefront-2 touch-target gaps found in broader sweep"
```

---

### Task 6: Push, deploy, and hand off for the user's phone/laptop spot-check

**Files:** none (deploy-only task).

- [ ] **Step 1: Push to the fork**

```bash
cd /c/Users/ajmal/Junaid/officialzella
git push fork main
```
Never push to `origin` — only `fork`, per this repo's established rule.

- [ ] **Step 2: Confirm auto-deploy picked it up**

```bash
vercel project ls
```
Expected: `storefront-2`'s "Updated" column shows a very recent time once Vercel's build finishes.

- [ ] **Step 3: Hand off to the user**

Tell the user storefront-2's mobile-first pass — including the new mobile nav — is live, and ask them to check the real site on their own phone and laptop, per the spec's verification workflow. Specifically flag the new hamburger menu for a deliberate look (open it, tap a link, confirm it closes and navigates correctly) since it's the one genuinely new piece of UI in this whole plan. Do not proceed to the admin plan until they respond.
