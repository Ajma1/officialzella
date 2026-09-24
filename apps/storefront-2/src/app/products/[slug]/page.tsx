import { notFound } from "next/navigation";
import { getProductBySlug } from "@zella/core/catalog";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductGallery from "@/components/ProductGallery";
import Reveal from "@/components/motion/Reveal";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const ratio = product.category === "TROUSER" ? "5 / 8" : "3 / 4";

  return (
    <section className="container" style={{ padding: "32px 28px 76px" }}>
      <Reveal className="grid-pdp" stagger={0.15} immediate>
        <ProductGallery
          images={product.images}
          productName={product.name}
          swatch={product.colorwaySwatch}
          ratio={ratio}
        />
        <div style={{ position: "sticky", top: 104 }}>
          <ProductBuyBox product={product} />
        </div>
      </Reveal>
    </section>
  );
}
