"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Product } from "@zella/core/catalog-types";
import { ArrowIcon } from "@/components/icons";

type Category = {
  id: string;
  name: string;
  blurb: string;
  href: string;
};

const categories: Category[] = [
  {
    id: "shirts",
    name: "Shirts",
    blurb: "Relaxed shirts, cut from breathable cotton — soft against the skin, roomy where it counts.",
    href: "/shirts",
  },
  {
    id: "trousers",
    name: "Trousers",
    blurb: "Easy trousers built to move with you, all day long.",
    href: "/trousers",
  },
  {
    id: "bundles",
    name: "Bundles",
    blurb: "Shirt + trousers, bundled together — the whole fit, sorted in one go.",
    href: "/bundles",
  },
];

const MotionLink = motion.create(Link);

export default function CategoryRows({
  shirtThumb,
  trouserThumb,
}: {
  shirtThumb?: Product;
  trouserThumb?: Product;
}) {
  return (
    <section className="relative bg-surface" aria-label="Shop by category">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="border-t-2 border-dashed border-foreground/15">
          {categories.map((category, i) => (
            <CategoryRow
              key={category.id}
              category={category}
              index={i}
              shirtThumb={shirtThumb}
              trouserThumb={trouserThumb}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryRow({
  category,
  index,
  shirtThumb,
  trouserThumb,
}: {
  category: Category;
  index: number;
  shirtThumb?: Product;
  trouserThumb?: Product;
}) {
  return (
    <MotionLink
      href={category.href}
      data-cursor-label="View"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.2, 0, 0, 1] }}
      className="group flex scroll-mt-24 items-center gap-6 border-b-2 border-dashed border-foreground/15 py-6 transition-colors duration-200 hover:bg-surface-warm sm:gap-10 sm:py-8"
    >
      <div className="shrink-0">
        {category.id === "bundles" ? (
          <BundleThumb shirt={shirtThumb} trouser={trouserThumb} />
        ) : (
          <SingleThumb product={category.id === "shirts" ? shirtThumb : trouserThumb} />
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-4xl leading-none tracking-tight text-foreground transition-colors duration-200 group-hover:text-cherry sm:text-6xl lg:text-7xl">
            {category.name}
          </h3>
          <p className="mt-2 max-w-md text-xs font-bold uppercase tracking-[0.15em] text-foreground/70 sm:text-sm">
            {category.blurb}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cherry text-surface transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-14 sm:w-14">
          <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
    </MotionLink>
  );
}

function SingleThumb({ product }: { product?: Product }) {
  const img = product?.images[0];
  return (
    <div className="relative h-20 w-20 -rotate-3 rounded-[14px] bg-surface p-1.5 shadow-lg shadow-background-deep/20 transition-transform duration-300 ease-out group-hover:rotate-0 sm:h-28 sm:w-28 sm:rounded-[18px] sm:p-2">
      <div
        className="image-outline relative h-full w-full overflow-hidden rounded-[8px] bg-surface-warm sm:rounded-[12px]"
        style={!img ? { background: product?.colorwaySwatch } : undefined}
      >
        {img && (
          <Image
            src={img.url}
            alt={img.alt || product?.name || ""}
            fill
            sizes="112px"
            className="animate-kenburns object-cover"
          />
        )}
      </div>
      <span className="absolute -top-1.5 left-1/2 h-3.5 w-9 -translate-x-1/2 -rotate-3 rounded-sm bg-sunshine/90 shadow-sm sm:h-4 sm:w-11" />
    </div>
  );
}

function BundleThumb({ shirt, trouser }: { shirt?: Product; trouser?: Product }) {
  const shirtImg = shirt?.images[0];
  const trouserImg = trouser?.images[0];
  return (
    <div className="relative h-20 w-24 sm:h-28 sm:w-32">
      <div className="absolute left-0 top-0 h-16 w-16 -rotate-6 rounded-[12px] bg-surface p-1.5 shadow-lg shadow-background-deep/20 transition-transform duration-300 ease-out group-hover:-rotate-3 sm:h-20 sm:w-20 sm:rounded-[16px]">
        <div
          className="image-outline relative h-full w-full overflow-hidden rounded-[7px] bg-surface-warm sm:rounded-[10px]"
          style={!shirtImg ? { background: shirt?.colorwaySwatch } : undefined}
        >
          {shirtImg && (
            <Image
              src={shirtImg.url}
              alt={shirtImg.alt || shirt?.name || ""}
              fill
              sizes="80px"
              className="animate-kenburns object-cover"
            />
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 h-16 w-16 rotate-6 rounded-[12px] bg-surface p-1.5 shadow-xl shadow-background-deep/25 transition-transform duration-300 ease-out group-hover:rotate-3 sm:h-20 sm:w-20 sm:rounded-[16px]">
        <div
          className="image-outline relative h-full w-full overflow-hidden rounded-[7px] bg-surface-warm sm:rounded-[10px]"
          style={!trouserImg ? { background: trouser?.colorwaySwatch } : undefined}
        >
          {trouserImg && (
            <Image
              src={trouserImg.url}
              alt={trouserImg.alt || trouser?.name || ""}
              fill
              sizes="80px"
              className="animate-kenburns object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}

