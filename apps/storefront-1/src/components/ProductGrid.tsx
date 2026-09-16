"use client";

import { motion } from "motion/react";
import type { Product } from "@/data/catalog.seed";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <motion.li
          key={product.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.2, 0, 0, 1] }}
        >
          <ProductCard product={product} index={i} />
        </motion.li>
      ))}
    </ul>
  );
}
