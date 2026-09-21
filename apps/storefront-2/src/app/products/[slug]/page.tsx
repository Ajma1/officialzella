import { notFound } from "next/navigation";
import { getProductBySlug } from "@zella/core/catalog";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductPlate from "@/components/ProductPlate";
import Reveal from "@/components/motion/Reveal";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const ratio = product.category === "TROUSER" ? "5 / 8" : "3 / 4";

  return (
    <section className="container" style={{ padding: "32px 28px 76px" }}>
      <Reveal className="grid-pdp" stagger={0.15} immediate>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          {product.images.length > 0 ? (
            product.images.map((img, i) => (
              <div key={img.url} style={{ gridColumn: i === 0 ? "span 2" : "auto" }}>
                <ProductPlate
                  src={img.url}
                  alt={img.alt ?? product.name}
                  swatch={product.colorwaySwatch}
                  ratio={ratio}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "span 2" }}>
              <ProductPlate src={null} alt={product.name} swatch={product.colorwaySwatch} ratio="5 / 8" />
            </div>
          )}
        </div>
        <div style={{ position: "sticky", top: 104 }}>
          <ProductBuyBox product={product} />
        </div>
      </Reveal>
    </section>
  );
}
