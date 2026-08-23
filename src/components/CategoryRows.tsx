"use client";

import Image from "next/image";
import { motion } from "motion/react";

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
    href: "#shirts",
  },
  {
    id: "trousers",
    name: "Trousers",
    blurb: "Easy trousers built to move with you, all day long.",
    href: "#trousers",
  },
  {
    id: "bundles",
    name: "Bundles",
    blurb: "Shirt + trousers, bundled together — the whole fit, sorted in one go.",
    href: "#bundles",
  },
];

export default function CategoryRows() {
  return (
    <section className="relative bg-surface" aria-label="Shop by category">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="border-t-2 border-dashed border-foreground/15">
          {categories.map((category, i) => (
            <CategoryRow key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryRow({ category, index }: { category: Category; index: number }) {
  return (
    <motion.a
      id={category.id}
      href={category.href}
      data-cursor-label="View"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.2, 0, 0, 1] }}
      className="group flex scroll-mt-24 items-center gap-6 border-b-2 border-dashed border-foreground/15 py-6 transition-colors duration-200 hover:bg-surface-warm sm:gap-10 sm:py-8"
    >
      <div className="shrink-0">
        {category.id === "bundles" ? <BundleThumb /> : <SingleThumb id={category.id} />}
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
    </motion.a>
  );
}

const thumbSrc: Record<string, { src: string; alt: string }> = {
  shirts: { src: "/shirt-sky-stripe.jpg", alt: "Zella sky-stripe relaxed-fit cotton shirt" },
  trousers: { src: "/shirt-mocha-stripe.jpg", alt: "Zella mocha-stripe cotton trousers fabric" },
};

function SingleThumb({ id }: { id: string }) {
  const img = thumbSrc[id];
  return (
    <div className="relative h-20 w-20 -rotate-3 rounded-[14px] bg-surface p-1.5 shadow-lg shadow-background-deep/20 transition-transform duration-300 ease-out group-hover:rotate-0 sm:h-28 sm:w-28 sm:rounded-[18px] sm:p-2">
      <div className="image-outline relative h-full w-full overflow-hidden rounded-[8px] bg-surface-warm sm:rounded-[12px]">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="112px"
          className="animate-kenburns object-cover"
        />
      </div>
      <span className="absolute -top-1.5 left-1/2 h-3.5 w-9 -translate-x-1/2 -rotate-3 rounded-sm bg-sunshine/90 shadow-sm sm:h-4 sm:w-11" />
    </div>
  );
}

function BundleThumb() {
  return (
    <div className="relative h-20 w-24 sm:h-28 sm:w-32">
      <div className="absolute left-0 top-0 h-16 w-16 -rotate-6 rounded-[12px] bg-surface p-1.5 shadow-lg shadow-background-deep/20 transition-transform duration-300 ease-out group-hover:-rotate-3 sm:h-20 sm:w-20 sm:rounded-[16px]">
        <div className="image-outline relative h-full w-full overflow-hidden rounded-[7px] bg-surface-warm sm:rounded-[10px]">
          <Image
            src="/shirt-burgundy.jpg"
            alt="Zella burgundy relaxed-fit cotton shirt"
            fill
            sizes="80px"
            className="animate-kenburns object-cover"
          />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 h-16 w-16 rotate-6 rounded-[12px] bg-surface p-1.5 shadow-xl shadow-background-deep/25 transition-transform duration-300 ease-out group-hover:rotate-3 sm:h-20 sm:w-20 sm:rounded-[16px]">
        <div className="image-outline relative h-full w-full overflow-hidden rounded-[7px] bg-surface-warm sm:rounded-[10px]">
          <Image
            src="/shirt-blue-stripe.jpg"
            alt="Zella blue-stripe cotton trousers fabric"
            fill
            sizes="80px"
            className="animate-kenburns object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12L12 4M12 4H6M12 4V10" />
    </svg>
  );
}
