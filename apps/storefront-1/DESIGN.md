---
name: Zella
description: A coquette dream-board storefront for loose-cotton shirts and trousers — whisper-blush ground, cherry accents, taped Polaroids, chunky bubble type.
colors:
  blush:
    "#fdf0f4"
  dusty-rose:
    "#eeb8cf"
  espresso-ink:
    "#2b1512"
  muted-plum:
    "#7a3a56"
  cream-surface:
    "#fff8ef"
  cream-warm:
    "#ffeee0"
  cherry:
    "#c81846"
  cherry-bright:
    "#ff2d55"
  lime-pop:
    "#cbff4d"
  grape-pop:
    "#b084ff"
  sunshine-pop:
    "#ffd23f"
  sky-pop:
    "#6fd3ff"
typography:
  display:
    fontFamily: "'Bagel Fat One', ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 13vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Fredoka, ui-rounded, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.15em"
  script:
    fontFamily: "Caveat, 'Comic Sans MS', cursive"
    fontSize: "1.25rem"
    fontWeight: 600
rounded:
  pill: "9999px"
  card: "18px"
  card-inset: "10px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.cherry}"
    textColor: "{colors.cream-surface}"
    rounded: "{rounded.pill}"
    padding: "16px 24px 16px 28px"
  button-primary-hover:
    backgroundColor: "{colors.cherry-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.espresso-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  nav-pill:
    backgroundColor: "{colors.cream-surface}"
    textColor: "{colors.espresso-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 10px"
  card-polaroid:
    backgroundColor: "{colors.cream-surface}"
    rounded: "{rounded.card}"
    padding: "10px 10px 24px"
---

# Design System: Zella

## Overview

**Creative North Star: "The Coquette Dream Board"**

Zella's storefront reads like a Pinterest mood board a shopper built for her own closet: a Polaroid stack of real cotton shirts taped down at jaunty angles on a whisper-soft blush field, a chunky bubble-letter headline that refuses to whisper, and a handful of stickers (a bow, a heart, a sparkle) idle-floating around the edges like someone doodled on the page. It replaces the site's original quiet-luxury cream/serif ecommerce default on purpose — this build reads as current, playful, and unmistakably made for its 18-24 Gen-Z shopper, not as a restrained catalog page. An initial version drenched the ground in full-saturation hot pink; user feedback ("it screams attention, tone it down") moved the ground to a near-white blush and let cherry-red alone carry the energy.

The palette leads with restraint now: the ground is barely-there blush, cream is reserved for content-bearing surfaces, and cherry-red is the one loud color, carrying every primary action and every moment of emphasis. That concentration is what keeps the page from going flat now that the ground is quiet — the energy didn't disappear, it moved onto a single, precise color.

**Key Characteristics:**
- Whisper-blush ground with a single loud cherry-red action color; cream is reserved for content-bearing surfaces.
- Bagel Fat One (chunky bubble display) paired with Fredoka (rounded, friendly body/UI) and Caveat (handwritten script for informal asides).
- Product photography is always framed as a taped Polaroid — rotated, cream-mounted, washi-taped — never a bare rectangular crop.
- Motion is bouncy and physical (spring easing, idle float, magnetic hover) rather than a single uniform fade.
- No kickers/eyebrows above headings — supplementary tags (like "new season") live on rotated sticker badges instead, in keeping with the scrapbook material world.

## Colors

Four functional roles plus a small set of decorative "pop" accents pulled from the product's own colorway names.

### Primary
- **Blush** (`#fdf0f4`): the page ground. A near-white tint with just enough pink to feel warm rather than a plain neutral — a Restrained strategy, not the Drenched full-saturation fill an earlier pass tried and walked back.
- **Dusty Rose** (`#eeb8cf`): the ground's shadow value — glow blobs, gradient depth, and the ticker's top border tint. Kept at low opacity (20–40%) so it reads as ambient atmosphere, not a second loud color competing with Cherry.

### Secondary
- **Cherry** (`#c81846`): every primary action — CTA buttons, the cart icon, badge fills, the cursor. Darkened from a brighter `#ff2d55` (**Cherry Bright**, used for the background glow only) specifically so cream text on it clears 4.5:1 contrast.

### Neutral
- **Cream Surface** (`#fff8ef`): every content-bearing surface — the nav pill, Polaroid mounts, the ticker band. This is where body text and product photography live.
- **Cream Warm** (`#ffeee0`): the Polaroid's inner mount tone, one step warmer than Cream Surface, so the photo frame reads as a distinct layer from the card edge.
- **Espresso Ink** (`#2b1512`): all text. Verified at 16:1 against both Blush and Cream Surface — safe to set body copy directly on the ground without fading it.
- **Muted Plum** (`#7a3a56`): reserved for future secondary text on cream surfaces only; not used at reduced opacity on the pink ground (see the Contrast Rule below).

### Semantic
- **Danger** (`#9a2f2f`, `--danger`): the one error colour, added with the
  storefront build (2026-09-07). Cherry carries every *action*, so it cannot also
  mean *error* — Danger is a deep brick that clears AA on both Blush (6.7:1) and
  Cream Surface (7.1:1). Used only for form-validation messages, the
  "no longer available" cart notice, and destructive-confirm affordances
  ("remove" on hover). Never a decorative fill.

### Named Rules
**The No-Fade-On-Pink Rule.** Text sitting directly on the ground is always full-opacity Espresso Ink, never a translucent tint of it. This mattered most when the ground was full-saturation hot pink (opacity blending pulled the effective color below 4.5:1 within a few steps); the rule stays even now that Blush is near-white, since it's the reason hierarchy comes from size, weight, and letter-spacing instead of fading the ink.

**The Colorway-Swatch Rule.** The small circle swatches near the CTA sample the *actual* product photography colors (Burgundy `#6d2733`, Lilac `#c6b3da`, Mocha `#a9926f`, Sky `#9cc6e8`, Butter `#f2d879`, Denim `#5b7bab`), never the decorative pop accents (Lime, Grape, Sunshine, Sky-pop). Product truth and brand decoration stay visually distinct.

## Typography

**Display Font:** Bagel Fat One (with `ui-rounded, system-ui, sans-serif` fallback)
**Body Font:** Fredoka (with `ui-rounded, "Segoe UI", system-ui, sans-serif` fallback)
**Script/Accent Font:** Caveat (with `"Comic Sans MS", cursive` fallback)

**Character:** Bagel Fat One is a single-weight, fully bubbled display face — it carries the headline's whole personality, so it is never paired with letter-spacing tricks or all-caps to add weight; Fredoka's rounded terminals keep every UI surface (nav, buttons, labels) feeling like the same soft material as the display face, rather than reading as a generic system sans underneath a loud headline. Caveat is used sparingly, only for handwritten asides (a Polaroid caption, a "see the lookbook" link, a sticker's "new").

### Hierarchy
- **Display** (400, `clamp(2.75rem, 13vw, 4.5rem)`, line-height 0.95): the hero headline only. Two lines, second line in Cherry with a hand-drawn underline squiggle beneath the final word.
- **Body** (400, 1.125rem, line-height 1.6): hero subcopy, set at full-opacity Espresso Ink directly on the pink ground.
- **Label** (700, 0.75rem, letter-spacing 0.15em, uppercase): "Colorways", ticker items, sticker badge captions.
- **Script** (600, 1.25rem): the dashed-border secondary link and Polaroid photo captions.

### Named Rules
**The One-Display-Face Rule.** Bagel Fat One is reserved for **the one big
headline of a page or major section** — the hero H1, a listing/story/checkout
page title, a story chapter's opening line, the cart/confirmation heading. It
always carries the page's single loudest moment, optionally with the cherry
accent-word + underline-squiggle device. Everything *below* that level —
sub-section headings ("You might also like"), form/section labels, result
counts, badges, the rotating circular tagline, the ticker — stays in Fredoka
(heavier weight) or the label/script styles, so the bubble face keeps its
impact instead of being diluted. (Amended 2026-09-07: the original rule said
"only the hero H1"; `CategoryRows` already used the display face for section
headings and the storefront build extended that to every page title.)

## Layout

Single-viewport hero: a floating cream nav pill over the blush field, a two-column grid below it (headline/copy/CTA left, Polaroid photo stack right, stacking to one column under `lg`), and a full-width cream ticker band closing the section. Container is capped at `max-w-7xl` with `px-6` mobile / `px-16` desktop gutters. The photo stack breaks the grid intentionally — Polaroids overlap their column edges and a floating sticker badge sits above the grid line (`z-20`) — so the collage reads as pinned-on-top rather than boxed-in.

## Elevation & Depth

Hybrid: flat color fields for the ground, soft diffuse shadows for anything meant to feel physically placed on top of it (Polaroids, the nav pill, buttons, the sticker badge). No hard-offset block shadows anywhere — this world never committed to a neobrutalist material, so that device stays off the table.

### Shadow Vocabulary
- **Ground glow** (`blur(100–110px)` radial fields in Dusty Rose at 40% / Cherry Bright at 20%): the only atmospheric effect; never used as a card backing. Kept deliberately faint now that the ground itself is light — the same opacities read as ambient tint against hot pink but as loud smudges against near-white, so they were turned down when the ground was.
- **Placed-object shadow** (Tailwind `shadow-lg`/`shadow-2xl`, tinted `background-deep/20–40` or `cherry/30`): every Polaroid, pill, and button — these are the elements physically "on" the pink field.

### Named Rules
**The Physical-Object Rule.** Only things meant to read as objects sitting on the pink ground (cards, pills, buttons, badges) get a shadow. The ground itself and its glow blobs never do.

## Shapes

Two form languages by role: **pill** (`rounded-full`) for anything interactive or navigational — nav bar, buttons, badges, swatches — and **soft card** (`18px` outer / `10px` inner) for anything photographic — the Polaroid frames. Nothing in between; a rectangular sharp-corner container would read as foreign to this world.

## Components

### Buttons
- **Shape:** full pill (`rounded-full`).
- **Primary:** Cherry background, Cream text, bold, `h-14`, drop shadow tinted `cherry/30`; magnetic hover (follows the cursor slightly) plus a spring scale-down on tap.
- **Secondary:** transparent with a dashed Espresso Ink border at 40% opacity, Caveat script label, switches border/text to Cherry on hover.

### Cards / Polaroids
- **Corner Style:** 18px outer, 10px inner photo window.
- **Background:** Cream Surface frame, Cream Warm photo mount.
- **Shadow Strategy:** `shadow-2xl` tinted `background-deep/30`.
- **Distinctive behavior:** enters on a spring (rotated further than its resting angle, settles with damping), straightens and scales up slightly on hover; carries a small rotated "washi tape" strip (Sunshine) at the top edge and a Caveat-script color-name caption at the bottom.

### Navigation
- A single floating cream pill bar (not a full-width bar) sitting with margin on all sides over the pink ground. Logo + bow icon left, link pills center-right (each gets a Cream Warm hover fill), Cherry circular cart button right with magnetic hover.

### Ticker (signature component)
A full-width Cream band running a seamless marquee of product facts (`100% cotton`, `relaxed fit`, …) in bold Cherry label type, each item separated by a small heart icon at 40% opacity. Reads as a charm-bracelet strip rather than a plain ticker tape.

### Sticker Badge (signature component)
A small circular Cherry badge (sparkle icon + Caveat "new" + label caption) that idle-floats and rotates gently, pinned above the Polaroid stack. This is the system's way of surfacing a supplementary tag (season, promo, etc.) — it replaces a kicker/eyebrow line above the headline, which this world does not use (see Don'ts).

### Custom Cursor
A filled Cherry heart (Cream outline) replaces the system cursor on fine-pointer devices; on hover over a labeled element it shrinks away and a Cherry pill with Cream label text takes over.

### Form Inputs (added 2026-09-07)
The storefront's checkout introduced the first real form fields. They use a
**third radius (`14px`)** — deliberately between the 10px photo-inset and the
18px card — so inputs read as their own material, neither photo nor card. Fill is
**Cream Warm**, border is a 2px transparent stroke that turns **Cherry** on
focus (on top of the global 3px Cherry focus-visible ring), and **Danger** when
`aria-invalid`. Labels sit above the field in Label type (uppercase, 0.12em
tracking); hints and error lines sit below in small Fredoka, the error line in
Danger with an `aria-describedby` link. Field cards group related inputs on a
Cream Surface panel with a bold Fredoka `<legend>`. The `.field` utility class
in `globals.css` is the single source.

## Do's and Don'ts

### Do:
- **Do** keep the ground a near-white blush tint — this is a Restrained strategy now. Pushing it back toward full saturation loses the calm the redesign was asked for; let Cherry carry the loudness instead.
- **Do** frame every piece of real product photography as a taped Polaroid (rotated, cream-mounted), never a bare rectangular image.
- **Do** use Espresso Ink at full opacity for any text set directly on the pink ground (see the No-Fade-On-Pink Rule).
- **Do** give interactive elements spring/magnetic motion rather than a linear ease; this world's motion signature is bouncy, not smooth-and-quiet.

### Don't:
- **Don't** add a kicker or eyebrow label above a heading. This build removed one during finishing (a "New season — cotton edit" pill sitting above the H1) and relocated the same information onto a rotated sticker badge instead — the heading carries its own weight here.
- **Don't** fade ink to gray for secondary text on the pink ground. Use full-opacity Espresso Ink or a solid (not translucent) darker tint instead.
- **Don't** introduce a second display face. Bagel Fat One is the only "loud" typeface; everything else is Fredoka or Caveat.
- **Don't** use hard-offset block shadows (`4px 4px 0`) — this world's depth language is soft and diffuse, not neobrutalist.
- **Don't** re-saturate the ground back toward full-strength pink. The near-white Blush ground is a confirmed user correction, not a provisional choice — Cherry is the world's one loud color now.
