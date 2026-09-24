import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory } from "@zella/core/catalog";
import { formatPrice } from "@zella/core/format";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import { getApprovedFeedback } from "@zella/core/feedback";
import ProductCard from "@/components/ProductCard";
import ProductPlate from "@/components/ProductPlate";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";

const MARQUEE = ["Made to last", "Relaxed fit", "Shirts & trousers", "For girls who move", "New season"];

const FABRICS = [
  { name: "Viscose-cotton", body: "The lightest of the edit — breathable, with a soft drape that catches air on warm days." },
  { name: "Cotton-linen mixture", body: "Textured and airy from the linen, kept soft against the skin by the cotton underneath." },
  { name: "Soft cotton", body: "Season-neutral. Light enough alone, substantial enough to layer when it turns." },
];

export default async function HomePage() {
  const [shirts, trousers] = await Promise.all([
    getProductsByCategory("SHIRT"),
    getProductsByCategory("TROUSER"),
  ]);
  const heroA = shirts.find((p) => p.images[0])?.images[0] ?? null;
  const heroB = shirts.filter((p) => p.images[0])[1]?.images[0] ?? null;
  const testimonials = await getApprovedFeedback(3);

  return (
    <div>
      {/* Hero — the photo bleeds to the viewport edge, the text keeps the
          page's container rhythm. Near-full-viewport on desktop; the sticky
          translucent nav floats over it. */}
      <section style={{ borderBottom: "1px solid var(--color-divider)", position: "relative" }}>
        <Reveal className="hero-bleed" stagger={0.18} immediate>
          <div className="hero-bleed__text">
            <p className="kicker">The edit</p>
            <h1 style={{ fontSize: "clamp(46px, 7.4vw, 104px)", lineHeight: 0.96, letterSpacing: "-0.025em", margin: 0 }}>
              Clothes for
              <br />
              <span style={{ fontStyle: "italic" }}>girls who move.</span>
            </h1>
            <p style={{ maxWidth: "42ch", margin: "28px 0 0", fontSize: 16, lineHeight: 1.65 }}>
              Button-down shirts and wide-leg trousers, cut with room to move.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
              <Link href="/pair" className="btn btn-primary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Make a pair
              </Link>
              <Link href="/shirts" className="btn btn-secondary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                The shirts
              </Link>
            </div>
          </div>
          <div className="hero-bleed__media">
            <div className="hero-media-frame">
              {heroA ? (
                <Parallax speed={8} style={{ position: "absolute", inset: "-6% 0", height: "112%" }}>
                  <Image
                    src={heroA.url}
                    alt={heroA.alt ?? ""}
                    fill
                    priority
                    sizes="(min-width: 768px) 62vw, calc(100vw - 56px)"
                    className="hero-media-full"
                  />
                </Parallax>
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "#efeae1", display: "flex", alignItems: "flex-end", padding: 16 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-900)" }}>
                    Photography coming soon
                  </span>
                </div>
              )}
            </div>
            {heroB && (
              <Parallax speed={-14} className="hero-media-inset">
                <ProductPlate src={heroB.url} alt={heroB.alt ?? ""} swatch="#efeae1" />
              </Parallax>
            )}
          </div>
        </Reveal>
      </section>

      {/* Marquee */}
      <div style={{ background: "var(--color-neutral-900)", color: "var(--color-neutral-100)", overflow: "hidden", padding: "15px 0" }}>
        <div className="marquee-track" style={{ display: "flex", width: "max-content", animation: "marquee 34s linear infinite" }}>
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 30, paddingRight: 30, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {m}
              <span style={{ color: "var(--color-accent)", fontSize: 8 }}>&#9670;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pair teaser */}
      <section style={{ background: "var(--color-neutral-900)", color: "var(--color-neutral-100)" }}>
        <Reveal
          className="container"
          style={{ padding: "78px 28px 86px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}
          stagger={0.15}
        >
          <div style={{ maxWidth: "48ch" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase", color: "var(--color-accent-400)", margin: "0 0 22px" }}>The pair</p>
            <h2 style={{ fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.02, margin: "0 0 18px" }}>Two pieces, one price.</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-neutral-100) 78%, transparent)" }}>
              Choose a shirt. Choose a trouser. {formatPrice(PAIR_PRICE_CENTS)}, always — whichever two you pick.
            </p>
          </div>
          <Link href="/pair" className="btn btn-primary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Make a pair
          </Link>
        </Reveal>
      </section>

      {/* Shirts */}
      <section className="container" style={{ padding: "84px 28px 76px" }}>
        <Reveal stagger={0.15}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--color-divider)", paddingBottom: 20, marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>The shirts</h2>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
              {formatPrice(shirts[0]?.priceCents ?? 0)}
            </p>
          </div>
          <div className="grid-products">
            {shirts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Fabric feature */}
      <section style={{ borderTop: "1px solid var(--color-divider)", background: "var(--color-surface)" }}>
        <div className="container" style={{ padding: "80px 28px" }}>
          <Reveal stagger={0.12}>
            <p className="kicker">The cloth</p>
            <h2 style={{ fontSize: "clamp(30px, 4.2vw, 52px)", lineHeight: 1.04, margin: "0 0 30px" }}>Made to breathe.</h2>
          </Reveal>
          <Reveal className="grid-fabric" stagger={0.12}>
            {FABRICS.map((f, i) => (
              <div key={f.name} style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 22 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, color: "var(--color-accent-700)" }}>{`0${i + 1}`}</span>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 21, margin: "8px 0 6px" }}>{f.name}</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-text) 76%, transparent)" }}>{f.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Trousers */}
      <section className="container" style={{ padding: "84px 28px 76px" }}>
        <Reveal stagger={0.15}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--color-divider)", paddingBottom: 20, marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>The trousers</h2>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
              {formatPrice(trousers[0]?.priceCents ?? 0)}
            </p>
          </div>
          <div className="grid-products">
            {trousers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      </section>

      {testimonials.length > 0 && (
        <section style={{ background: "var(--color-accent-100)", padding: "78px 0 84px" }}>
          <div className="container" style={{ padding: "0 28px" }}>
            <p className="kicker">What people are saying</p>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "0 0 34px" }}>Loved by our customers</h2>
            <Reveal className="grid-fabric" stagger={0.12}>
              {testimonials.map((t) => (
                <div key={t.id} style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 18 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 15, letterSpacing: "0.05em" }}>
                    {"★".repeat(t.rating)}
                    {"☆".repeat(5 - t.rating)}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6 }}>{t.message}</p>
                  <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
                    {t.name || "Verified customer"}
                  </p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container" style={{ padding: "86px 28px 96px", textAlign: "center" }}>
        <Reveal stagger={0.12}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 62px)", lineHeight: 1.04, margin: "0 auto 30px", maxWidth: "22ch" }}>Your shirt is waiting.</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href="/pair" className="btn btn-primary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Make a pair
            </Link>
            <Link href="/size-guide" className="btn btn-secondary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Size chart
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
