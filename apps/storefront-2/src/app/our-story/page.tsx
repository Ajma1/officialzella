import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our Story — Zella" };

// Brand-story copy, storefront-2 specific — no longer mirrors storefront-1
// verbatim (see luxury redesign work: the "cotton" framing was dropped
// site-wide in favor of the fit/movement story, which is the actual
// differentiator — not every garment is 100% cotton, see the fabric mix
// on the homepage's "The cloth" section).
const SECTIONS = [
  {
    heading: "Where it started",
    body: "Zella began with one frustration: everyday clothes that looked relaxed on the hanger and then pulled tight the moment you actually moved in them. So we started over — building every fit around movement first, in fabrics chosen for how they actually feel on.",
  },
  {
    heading: "The fit philosophy",
    body: "Roomy where it counts. Our shirts sit easy through the shoulder and body; our trousers move with you all day. Nothing clings, nothing rides up, nothing asks you to hold still for it.",
  },
  {
    heading: "One edit at a time",
    body: "We don't chase every trend. Each season is a small, considered edit of shirts and trousers in colourways we actually want to wear — made to layer, made to last, made to come back to.",
  },
];

export default function OurStoryPage() {
  return (
    <section className="container-narrow" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">Our story</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.04, margin: "0 0 38px" }}>Made for the way you move.</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 style={{ fontSize: 21, margin: "0 0 9px" }}>{s.heading}</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "color-mix(in srgb, var(--color-text) 84%, transparent)" }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
