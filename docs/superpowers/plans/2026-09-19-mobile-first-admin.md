# Mobile-First Responsive Pass — admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page of `apps/admin` (the internal order/inventory management tool) usable on a phone — fixing real touch-target violations and a header that overflows on every page — without adding a new shared component, changing content, or restructuring any flow.

**Architecture:** admin is Tailwind CSS v4 with **no shared Button/Input component** (unlike storefront-2's `.btn`/`.input` classes) — every interactive element repeats its own Tailwind class string. That means, unlike storefront-2, there's no 2-line root-cause fix; this plan fixes each element directly, the same way storefront-1's plan did. Admin's `AdminLayout` header has zero responsive handling and genuinely overflows on narrow phones (worse than storefront-2's case was, since it also displays the logged-in user's email, an unbounded-width string) — the fix here stays inside the "responsive-CSS pass" scope without needing a spec exception, because a `flex-wrap` reflow (not a hamburger/new component) resolves it.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Vitest, Supabase Auth.

**Spec:** `docs/superpowers/specs/2026-09-17-mobile-first-responsive-design.md`

## Global Constraints

- Breakpoint scale: **xs** < 480px, **s** 480–767px, **m** 768–1023px, **l** ≥ 1024px, mapped onto Tailwind's `sm`(640)/`md`(768)/`lg`(1024).
- **Touch-target law**: every tappable control needs a minimum 44×44px hit area, on **both axes** — a lesson carried forward from storefront-2's final review, which found a real violation (cart qty steppers) because an earlier fix only checked height. Every fix in this plan must be verified on both width and height, not just height.
- **No new shared component.** Admin has no `.btn`/`.input` equivalent, and this plan doesn't introduce one — that would cross from "responsive-CSS pass" into a structural refactor. Fix each element's own className directly.
- **The standard fix template** (carried forward from storefront-1's plan, already proven through two prior reviews): for a small text button/link under 44px, add `min-h-11 flex items-center justify-center` (centered content) or `min-h-11 flex items-center` (left-aligned text/link) to its existing className, preserving every existing class. For a native `<input>`/`<select>` (which centers its own text vertically without needing `flex`), add `min-h-11` alone alongside its existing classes.
- **Keep `InventoryForm.tsx`'s existing `overflow-x-auto` table fallback.** Its stock table is genuinely wide (SKU, product, 2 size columns, total, status) — collapsing it to stacked cards would be a bigger restructuring than a CSS pass; the existing horizontal-scroll-in-a-box is a legitimate, already-implemented mobile fallback. Only fix touch targets inside it, not its overall structure.
- **No content, navigation route, or behavior changes.** The one reflow exception (`AdminLayout`'s header wrapping instead of overflowing) is not a "nav-pattern change" — it's the same links, same order, just allowed to wrap, matching the scope boundary already used for storefront-1's grids.
- Build + lint + full test suite (`npm run build --workspace=@zella/admin`, `npm run lint --workspace=@zella/admin`, `npm run test --workspaces --if-present` at repo root) must stay green after every task.
- Commit after each task; push to `fork` only, never `origin` — `git push fork main`.

---

### Task 1: Fix `AdminLayout`'s header — the global nav that appears on every page

Confirmed by audit: the header renders "Zella Admin" logo, 3 nav links (Products/Orders/Inventory), a divider, the logged-in user's **email** (unbounded width), and a "Sign out" button, all in one unbroken `flex items-center justify-between` row with zero responsive handling. This overflows on every phone, on every admin page, and is worse than storefront-2's equivalent case since email length is unpredictable.

**Files:**
- Modify: `apps/admin/src/app/admin/layout.tsx`

**Interfaces:** None — className-only changes, same markup structure.

- [ ] **Step 1: Confirm current content (pre-fix check)**

```bash
cd /c/Users/ajmal/Junaid/officialzella
sed -n '19,61p' apps/admin/src/app/admin/layout.tsx
```
Confirm it matches the header structure described above before editing.

- [ ] **Step 2: Rewrite the header for mobile-first reflow**

Replace:
```tsx
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display text-lg">
            Zella Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-neutral-600">
            <Link
              href="/admin/products"
              className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Orders
            </Link>
            <Link
              href="/admin/inventory"
              className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Inventory
            </Link>
            <span className="mx-2 h-4 w-px bg-neutral-200" />
            <span className="px-2 text-neutral-400">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
```
with:
```tsx
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
          <Link href="/admin" className="font-display text-lg">
            Zella Admin
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-neutral-600 sm:ml-auto">
            <Link
              href="/admin/products"
              className="flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Orders
            </Link>
            <Link
              href="/admin/inventory"
              className="flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Inventory
            </Link>
            <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:block" />
            <span className="hidden px-2 text-neutral-400 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
```

What changed and why:
- Outer container gets `flex-wrap` + explicit `gap-x-4 gap-y-2` (replacing `justify-between`, which fights wrapping) — below the point where the logo + nav no longer fit one line, the nav drops to its own line instead of overflowing.
- `<nav>` also gets `flex-wrap` and `sm:ml-auto` (pushes it to the row's right edge only once there's room — from `sm` up, matching the original `justify-between` look; below `sm`, it wraps under the logo naturally without needing `justify-between`'s forced spacing).
- The email display and its divider are hidden below `sm` (`hidden ... sm:inline` / `sm:block`) — it's a "logged in as" convenience, not load-bearing information; the owner already knows who they are, and this is the single largest unbounded-width risk in the row.
- Every link/button in the nav gets `flex min-h-11 items-center` added (dropping the vertical-only `py-1.5`, replaced by `min-h-11` — horizontal `px-3` stays) — closes the touch-target gap on all four.

- [ ] **Step 3: Build, lint, test**

```bash
cd /c/Users/ajmal/Junaid/officialzella
npm run build --workspace=@zella/admin
npm run lint --workspace=@zella/admin
npm run test --workspaces --if-present
```
Expected: build succeeds, lint clean, all tests pass (72 in `@zella/core` as of this plan's writing; admin itself has no test files).

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/admin/layout.tsx
git commit -m "fix: make admin's header wrap on mobile instead of overflowing"
```

---

### Task 2: Fix the login page

Confirmed: submit button (`py-2.5` ≈ 40px tall) and both inputs (`py-2` ≈ 36px tall) are under 44px. This is the very first screen anyone (including the owner, from their phone) sees.

**Files:**
- Modify: `apps/admin/src/app/admin/login/page.tsx`

**Interfaces:** None.

- [ ] **Step 1: Fix both inputs**

Both `email` and `password` inputs currently share this className:
```tsx
className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
```
Add `min-h-11` to both (native inputs center their text vertically without needing `flex`):
```tsx
className="mt-1 w-full min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
```

- [ ] **Step 2: Fix the submit button**

Current:
```tsx
className="mt-6 w-full rounded-lg bg-cherry py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
```
Add `flex min-h-11 items-center justify-center` (the button has no `display` set today, so it's a block-level `<button>` — adding `flex` here is safe since `w-full` already makes it span the full width either way):
```tsx
className="mt-6 flex min-h-11 w-full items-center justify-center rounded-lg bg-cherry py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
```

- [ ] **Step 3: Build, lint, test**

Same three commands as Task 1 Step 3.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/app/admin/login/page.tsx
git commit -m "fix: bump login page's touch targets to 44px minimum"
```

---

### Task 3: Fix the list/detail pages — orders, products, inventory headers, order detail, edit-product header

Five small, related fixes across four files: primary-action buttons under 44px, a status-update form, and list rows that cram multiple inline info clusters with no wrap allowance.

**Files:**
- Modify: `apps/admin/src/app/admin/products/page.tsx` ("New product" button + product row reflow)
- Modify: `apps/admin/src/app/admin/orders/page.tsx` (order row reflow)
- Modify: `apps/admin/src/app/admin/orders/[id]/page.tsx` ("Update" button + status select)
- Modify: `apps/admin/src/app/admin/products/[id]/edit/page.tsx` ("Delete product" button)

**Interfaces:** None.

- [ ] **Step 1: Fix products/page.tsx's "New product" button**

Current:
```tsx
className="rounded-lg bg-cherry px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
```
Change to:
```tsx
className="flex min-h-11 items-center rounded-lg bg-cherry px-4 text-sm font-semibold text-white hover:opacity-90"
```
(dropped `py-2`, replaced by `min-h-11` + `flex items-center`).

- [ ] **Step 2: Allow the product row to wrap on narrow viewports**

Current row:
```tsx
<Link
  key={product.id}
  href={`/admin/products/${product.id}/edit`}
  className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
>
```
Add `flex-wrap`:
```tsx
<Link
  key={product.id}
  href={`/admin/products/${product.id}/edit`}
  className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-neutral-50"
>
```
Below the thumbnail + `min-w-0 flex-1` name/meta block (which itself doesn't shrink below its content's natural minimum before wrapping), the price and status badge will drop to their own line on narrow viewports instead of forcing the row wider than the viewport. No other change needed — `min-w-0 flex-1` on the name block already lets it shrink/truncate correctly; `flex-wrap` on the parent is the only missing piece.

- [ ] **Step 3: Apply the same `flex-wrap` fix to orders/page.tsx's order row**

Current:
```tsx
<Link
  key={order.id}
  href={`/admin/orders/${order.id}`}
  className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
>
```
Change to:
```tsx
<Link
  key={order.id}
  href={`/admin/orders/${order.id}`}
  className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-neutral-50"
>
```
Same reasoning as Step 2 — this row has four inline clusters (name/meta, "COD" badge, price, status badge); `flex-wrap` lets the trailing three drop to a second line under the name on narrow viewports.

- [ ] **Step 4: Fix orders/[id]/page.tsx's status-update form**

Current:
```tsx
<form action={boundUpdate} className="mt-6 flex items-center gap-3">
  <label htmlFor="status" className="text-sm font-medium">
    Status
  </label>
  <select
    id="status"
    name="status"
    defaultValue={order.status}
    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
  >
    {STATUS_OPTIONS.map((s) => (
      <option key={s} value={s}>
        {s.replaceAll("_", " ").toLowerCase()}
      </option>
    ))}
  </select>
  <button
    type="submit"
    className="rounded-lg bg-cherry px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
  >
    Update
  </button>
</form>
```
Change to:
```tsx
<form action={boundUpdate} className="mt-6 flex flex-wrap items-center gap-3">
  <label htmlFor="status" className="text-sm font-medium">
    Status
  </label>
  <select
    id="status"
    name="status"
    defaultValue={order.status}
    className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
  >
    {STATUS_OPTIONS.map((s) => (
      <option key={s} value={s}>
        {s.replaceAll("_", " ").toLowerCase()}
      </option>
    ))}
  </select>
  <button
    type="submit"
    className="flex min-h-11 items-center rounded-lg bg-cherry px-4 text-sm font-semibold text-white hover:opacity-90"
  >
    Update
  </button>
</form>
```
(`flex-wrap` on the form lets the button drop below the select if the longest status label — "out for delivery" — pushes the row too wide on a narrow phone; `min-h-11` added to the select and the button/flex treatment matching every other button fix in this plan.)

- [ ] **Step 5: Fix products/[id]/edit/page.tsx's "Delete product" button**

Current:
```tsx
<button
  type="submit"
  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
>
  Delete product
</button>
```
Change to:
```tsx
<button
  type="submit"
  className="flex min-h-11 items-center rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50"
>
  Delete product
</button>
```

- [ ] **Step 6: Build, lint, test**

Same three commands as Task 1 Step 3.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/app/admin/products/page.tsx apps/admin/src/app/admin/orders/page.tsx "apps/admin/src/app/admin/orders/[id]/page.tsx" "apps/admin/src/app/admin/products/[id]/edit/page.tsx"
git commit -m "fix: touch targets and row reflow across admin's list/detail pages"
```

---

### Task 4: Fix ProductForm.tsx

The largest single file in this plan: two unresponsive `grid-cols-2` field-pair rows, a `grid-cols-5` stock grid that should be `grid-cols-2` (the form only ever renders 2 sizes — `SIZES = ["S", "M"] as const` — so the extra 3 grid tracks are a pre-existing correctness bug, not just a mobile issue; fixing the column count fixes both), roughly eight text/number/select inputs under 44px tall, a submit button under 44px, and a "Remove image" button that's both far too small (20px) **and** invisible on touch devices (it only becomes visible via `group-hover`, and touchscreens have no hover state).

**Files:**
- Modify: `apps/admin/src/app/admin/products/ProductForm.tsx`

**Interfaces:** None — this form is used identically by `products/new/page.tsx` and `products/[id]/edit/page.tsx`; neither needs any change.

- [ ] **Step 1: Fix the two `grid-cols-2` field-pair rows**

Both occurrences (Category/Price at line ~91, Colorway/Compare-at at line ~129) currently read:
```tsx
<div className="grid grid-cols-2 gap-4">
```
Change both to:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
```
(mobile-first: single column below `sm`, two columns from `sm` up — matches the pattern used throughout the storefront-1 plan for the same shape of fix.)

- [ ] **Step 2: Fix the stock grid — both the column-count bug and mobile sizing**

Current:
```tsx
<div className="mt-1 grid grid-cols-5 gap-2">
```
Change to:
```tsx
<div className="mt-1 grid grid-cols-2 gap-2">
```
(`SIZES` is `["S", "M"] as const` — a 5-column grid for 2 items was always wrong, not just on mobile; `grid-cols-2` is correct at every breakpoint.)

- [ ] **Step 3: Add `min-h-11` to every text/number/select input in this file**

Read the file and find every `<input>` (excluding `type="checkbox"`, `type="color"`, and `type="file"` — those have their own sizing conventions and aren't part of this fix) and every `<select>`. Each currently uses a className containing `px-3 py-2` or `px-2 py-2` alongside `rounded-lg border border-neutral-300 ... text-sm`. Add `min-h-11` to each one's className (position doesn't matter, but keep it near the other sizing/layout classes for readability). This includes: the category select, the price input, the colorway input, the compare-at input, and each of the two (S, M) stock inputs inside the grid fixed in Step 2.

Verify you found them all:
```bash
grep -c 'px-3 py-2\|px-2 py-2' apps/admin/src/app/admin/products/ProductForm.tsx
```
Then re-run it after your edits — every match should now also have `min-h-11` on the same className string (check by eye, the grep count alone doesn't confirm this).

- [ ] **Step 4: Fix the "Remove image" button — both size and touch visibility**

Current:
```tsx
<button
  type="button"
  onClick={() =>
    deleteProductImage(img.id, initial.id!)
  }
  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
  aria-label="Remove image"
>
  ×
</button>
```
This button is both under 44px (`h-5 w-5` = 20px) and permanently invisible on any device without hover (every touchscreen) — `opacity-0` with only a `group-hover:opacity-100` escape means a phone user can never see or tap it at all. Fix both problems:
```tsx
<button
  type="button"
  onClick={() =>
    deleteProductImage(img.id, initial.id!)
  }
  className="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-sm text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
  aria-label="Remove image"
>
  ×
</button>
```
What changed: `h-5 w-5` → `h-11 w-11` (44px); `text-xs` → `text-sm` (readable at the new size); the hover-reveal behavior now only applies from `sm` up (`sm:opacity-0 sm:group-hover:opacity-100`) — below `sm`, `opacity-100` makes it permanently visible, since there's no hover to reveal it on. The position offsets (`-right-1.5 -top-1.5` → `-right-2 -top-2`) are nudged slightly to keep the now-larger circle visually balanced against the 80px (`h-20 w-20`) image thumbnail — read the surrounding `<div key={img.id} className="group relative h-20 w-20">` for context before editing to confirm this still looks reasonable (a 44px circle over an 80px thumbnail is a substantial fraction of it — if it looks wrong once built, prefer keeping it correct-but-large over shrinking it back below 44px).

- [ ] **Step 5: Fix the submit button**

Current:
```tsx
<button
  type="submit"
  disabled={pending}
  className="rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
>
  {pending ? "Saving…" : submitLabel}
</button>
```
Change to:
```tsx
<button
  type="submit"
  disabled={pending}
  className="flex min-h-11 items-center rounded-lg bg-cherry px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
>
  {pending ? "Saving…" : submitLabel}
</button>
```

- [ ] **Step 6: Build, lint, test**

Same three commands as Task 1 Step 3.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/app/admin/products/ProductForm.tsx
git commit -m "fix: mobile-first grids and touch targets in ProductForm"
```

---

### Task 5: Fix InventoryForm.tsx

The stock-management table — genuinely the highest-density UI in admin. Its `overflow-x-auto` wrapper already provides a working mobile fallback (horizontal scroll inside a bounded box, not a page-breaking overflow) — **keep that structure**. Fix only the per-cell stock inputs (under 44px tall) and the Save button.

**Files:**
- Modify: `apps/admin/src/app/admin/inventory/InventoryForm.tsx`

**Interfaces:** None.

- [ ] **Step 1: Fix the per-size stock number inputs**

Current:
```tsx
<input
  type="number"
  name={`stock_${v.id}`}
  defaultValue={v.stock}
  min="0"
  step="1"
  className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
/>
```
Add `min-h-11`:
```tsx
<input
  type="number"
  name={`stock_${v.id}`}
  defaultValue={v.stock}
  min="0"
  step="1"
  className="min-h-11 w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
/>
```
The existing `w-20` (80px) already comfortably clears the 44px width minimum — only height needed the fix.

- [ ] **Step 2: Fix the "Save inventory" button**

Current:
```tsx
<button
  type="submit"
  disabled={pending}
  className="rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
>
  {pending ? "Saving…" : "Save inventory"}
</button>
```
Change to:
```tsx
<button
  type="submit"
  disabled={pending}
  className="flex min-h-11 items-center rounded-lg bg-cherry px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
>
  {pending ? "Saving…" : "Save inventory"}
</button>
```

- [ ] **Step 3: Verify the table's `overflow-x-auto` wrapper is intact**

```bash
grep -n "overflow-x-auto" apps/admin/src/app/admin/inventory/InventoryForm.tsx
```
Confirm this line still wraps the `<table>` unchanged — this task must not touch the table's structural layout, only the two element fixes above.

- [ ] **Step 4: Build, lint, test**

Same three commands as Task 1 Step 3.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/app/admin/inventory/InventoryForm.tsx
git commit -m "fix: touch targets in InventoryForm, keep its overflow-x-auto table fallback"
```

---

### Task 6: Broader audit sweep for anything the targeted fixes missed

Every file this session directly read is covered by Tasks 1-5. This task re-sweeps the whole app once more, computing actual rendered size on **both axes** (the exact lesson storefront-2's final review surfaced) rather than trusting the file list above is exhaustive.

**Files to sweep (confirm the file list itself first — this plan's audit found these files; a new file could exist that wasn't read):**

```bash
find apps/admin/src -name "*.tsx"
```
Compare the result against: `layout.tsx`, `orders/page.tsx`, `orders/[id]/page.tsx`, `orders/actions.ts` (not a `.tsx`, skip), `products/page.tsx`, `products/new/page.tsx`, `products/[id]/edit/page.tsx`, `products/ProductForm.tsx`, `inventory/page.tsx`, `inventory/InventoryForm.tsx`, `login/page.tsx`, root `layout.tsx`/`page.tsx` (the redirect-only files — no interactive elements, already known safe). If the sweep finds a file not in this list, read it and apply Step 1 below to it too.

**Interfaces:** None expected. If a genuinely new judgment call arises, stop and report rather than improvising.

- [ ] **Step 1: For every `<button>`, `<Link href=`, `<a href=`, `<input>`, and `<select>` in every file above, compute its rendered height AND width**

For each: read its className. If it already has `min-h-11` (or `h-11`/`h-full` inside a `min-h-11` parent) from Tasks 1-5, skip it. For anything else: compute height (Tailwind `py-N` × 2, in px, plus the text size's line-height — `text-sm` defaults to 20px line-height, `text-xs` to 16px, unless an explicit `leading-*` class overrides it) and width (explicit `w-N`, or the content's natural width if unset — for icon-only buttons with no text, check for an explicit `w-N`/`h-N` pair). Fix anything under 44px on either axis the same way Tasks 1-5 did: `min-h-11` (+ `flex items-center [justify-center]` if it's not already a native input/select) for height, `min-w-11` added alongside `min-h-11` for width if the element is icon-only or otherwise narrow.

- [ ] **Step 2: Build, lint, test**

Same three commands as Task 1 Step 3.

- [ ] **Step 3: Commit** (only if Step 1 found and fixed something beyond Tasks 1-5 — do not create an empty commit)

```bash
git add apps/admin/src
git commit -m "fix: close remaining admin touch-target gaps found in broader sweep"
```

---

### Task 7: Push, deploy, and hand off for the user's phone/laptop spot-check

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
Expected: `admin`'s "Updated" column shows a very recent time once Vercel's build finishes.

- [ ] **Step 3: Hand off to the user**

Tell the user admin's mobile-first pass is live, and ask them to check the real site on their own phone and laptop — specifically the header at a few window widths (confirm it wraps instead of overflowing, and that the email/divider correctly reappear once the window is wide enough), the product-image "Remove" button on a touch device (confirm it's now visible without needing a hover), and the inventory table's horizontal scroll on a phone. This is the last app in the mobile-first spec — once this is confirmed, the whole three-app plan is done.
