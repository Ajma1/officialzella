import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory } from "@zella/core/catalog";
import { formatPrice } from "@zella/core/format";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import ProductCard from "@/components/ProductCard";
import ProductPlate from "@/components/ProductPlate";

const MARQUEE = ["100% cotton", "Relaxed fit", "Shirts & trousers", "For girls who move", "New season"];

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
  const lookbook = shirts.filter((p) => p.images[0]).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--color-divider)" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.02fr) minmax(0, 1fr)",
            gap: 52,
            alignItems: "center",
            padding: "72px 28px 86px",
          }}
        >
          <div>
            <p className="kicker">The cotton edit</p>
            <h1 style={{ fontSize: "clamp(46px, 7vw, 92px)", lineHeight: 0.98, letterSpacing: "-0.025em", margin: 0 }}>
              Loose cotton,
              <br />
              cut for the
              <br />
              <span style={{ fontStyle: "italic" }}>way you move.</span>
            </h1>
            <p style={{ maxWidth: "42ch", margin: "28px 0 0", fontSize: 16, lineHeight: 1.65 }}>
              Button-down shirts and wide-leg trousers, woven to breathe and cut with room to move.
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {heroA && <ProductPlate src={heroA.url} alt={heroA.alt ?? ""} swatch="#efeae1" />}
            {heroB && <div style={{ marginTop: 46 }}><ProductPlate src={heroB.url} alt={heroB.alt ?? ""} swatch="#efeae1" /></div>}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ background: "var(--color-neutral-900)", color: "var(--color-neutral-100)", overflow: "hidden", padding: "15px 0" }}>
        <div style={{ display: "flex", width: "max-content", animation: "marquee 34s linear infinite" }}>
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
        <div className="container" style={{ padding: "78px 28px 86px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
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
        </div>
      </section>

      {/* Shirts */}
      <section className="container" style={{ padding: "84px 28px 76px" }}>
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
      </section>

      {/* Fabric feature */}
      <section style={{ borderTop: "1px solid var(--color-divider)", background: "var(--color-surface)" }}>
        <div className="container" style={{ padding: "80px 28px" }}>
          <p className="kicker">The cloth</p>
          <h2 style={{ fontSize: "clamp(30px, 4.2vw, 52px)", lineHeight: 1.04, margin: "0 0 30px" }}>Made to breathe.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 30 }}>
            {FABRICS.map((f, i) => (
              <div key={f.name} style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 22 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, color: "var(--color-accent-700)" }}>{`0${i + 1}`}</span>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: 21, margin: "8px 0 6px" }}>{f.name}</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-text) 76%, transparent)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trousers */}
      <section className="container" style={{ padding: "84px 28px 76px" }}>
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
      </section>

      {/* Worn together */}
      {lookbook.length > 0 && (
        <section style={{ background: "var(--color-neutral-900)", color: "var(--color-neutral-100)", padding: "78px 0 84px" }}>
          <div className="container" style={{ padding: "0 28px 34px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>Worn together</h2>
          </div>
          <div style={{ display: "flex", gap: 22, overflowX: "auto", padding: "4px 28px 22px" }}>
            {lookbook.map((p) => (
              <figure key={p.id} style={{ margin: 0, flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="plate" style={{ position: "relative", width: "100%", aspectRatio: "3 / 4" }}>
                  <Image src={p.images[0]!.url} alt={p.images[0]!.alt ?? p.name} fill sizes="260px" style={{ objectFit: "cover" }} />
                </div>
                <figcaption style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-neutral-100) 62%, transparent)" }}>
                  {p.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container" style={{ padding: "86px 28px 96px", textAlign: "center" }}>
        <p className="kicker">Small and medium</p>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 62px)", lineHeight: 1.04, margin: "0 auto 30px", maxWidth: "22ch" }}>Your shirt is waiting.</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link href="/pair" className="btn btn-primary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Make a pair
          </Link>
          <Link href="/size-guide" className="btn btn-secondary" style={{ padding: "14px 28px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Size chart
          </Link>
        </div>
      </section>
    </div>
  );
}
