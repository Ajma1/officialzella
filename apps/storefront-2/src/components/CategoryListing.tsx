import Link from "next/link";
import { getProductsByCategory } from "@zella/core/catalog";
import { formatPrice } from "@zella/core/format";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import type { Category } from "@zella/core/catalog-types";
import ProductCard from "./ProductCard";
import Reveal from "./motion/Reveal";

export default async function CategoryListing({
  category,
  kicker,
  title,
  blurb,
}: {
  category: Category;
  kicker: string;
  title: string;
  blurb: string;
}) {
  const products = await getProductsByCategory(category);

  return (
    <section className="container" style={{ padding: "50px 28px 76px" }}>
      <Reveal stagger={0.15}>
        <p className="kicker">{kicker}</p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            borderBottom: "1px solid var(--color-divider)",
            paddingBottom: 20,
            marginBottom: 34,
          }}
        >
          <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", margin: 0 }}>{title}</h1>
          <p style={{ margin: 0, maxWidth: "40ch", fontSize: 14, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-text) 76%, transparent)" }}>
            {blurb}
          </p>
        </div>

        <div className="grid-products">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            border: "1px solid var(--color-divider)",
            borderRadius: "var(--radius-md)",
            padding: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: "0 0 6px", fontFamily: "var(--font-heading)", fontSize: 24 }}>Make it a pair</p>
            <p style={{ margin: 0, fontSize: 14, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
              Any shirt + any trouser, {formatPrice(PAIR_PRICE_CENTS)}.
            </p>
          </div>
          <Link href="/pair" className="btn btn-primary" style={{ padding: "13px 24px", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Make a pair
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
