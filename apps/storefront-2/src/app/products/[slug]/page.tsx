import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@zella/core/catalog";
import ProductBuyBox from "@/components/ProductBuyBox";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <section className="container" style={{ padding: "32px 28px 76px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)", gap: 54, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          {product.images.length > 0 ? (
            product.images.map((img, i) => (
              <div key={img.url} className="plate" style={{ position: "relative", aspectRatio: product.category === "TROUSER" ? "5 / 8" : "3 / 4", gridColumn: i === 0 ? "span 2" : "auto" }}>
                <Image src={img.url} alt={img.alt ?? product.name} fill sizes="(min-width: 768px) 50vw, 100vw" style={{ objectFit: "cover", objectPosition: "50% 22%" }} />
              </div>
            ))
          ) : (
            <div className="plate" style={{ gridColumn: "span 2", aspectRatio: "5 / 8", background: product.colorwaySwatch, display: "flex", alignItems: "flex-end", padding: 18 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-900)" }}>
                Photography coming soon
              </span>
            </div>
          )}
        </div>
        <div style={{ position: "sticky", top: 104 }}>
          <ProductBuyBox product={product} />
        </div>
      </div>
    </section>
  );
}
