"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { motion } from "motion/react";

/**
 * The taped-Polaroid frame — the only way real product photography appears in
 * this world (DESIGN.md). `src` absent ⇒ "photo coming soon" placeholder mode
 * (cream-warm window + large colorway swatch + Caveat note).
 *
 * Sizing comes from the parent (width) + `aspect` (defaults 4/5). The frame,
 * sunshine washi-tape, and Caveat caption are always drawn.
 */
export default function Polaroid({
  src,
  alt = "",
  caption,
  swatch = "#e9c9d6",
  rotate = -3,
  hover = true,
  animateIn = false,
  delay = 0,
  kenburns = false,
  sizes = "(min-width: 1024px) 22rem, 45vw",
  priority = false,
  aspect = "4 / 5",
  className = "",
  children,
}: {
  src?: string;
  alt?: string;
  caption?: string;
  swatch?: string;
  rotate?: number;
  hover?: boolean;
  animateIn?: boolean;
  delay?: number;
  kenburns?: boolean;
  sizes?: string;
  priority?: boolean;
  aspect?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={animateIn ? { opacity: 0, rotate: rotate * 2.5, scale: 0.88, y: 20 } : false}
      animate={animateIn ? { opacity: 1, rotate, scale: 1, y: 0 } : { rotate }}
      whileHover={hover ? { rotate: 0, scale: 1.04, zIndex: 20 } : undefined}
      transition={{ type: "spring", stiffness: 140, damping: 13, mass: 0.6, delay }}
      className={`relative rounded-[18px] bg-surface p-2.5 pb-6 shadow-2xl shadow-background-deep/30 ${className}`}
    >
      <div
        className="image-outline relative w-full overflow-hidden rounded-[10px] bg-surface-warm"
        style={{ aspectRatio: aspect }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover ${kenburns ? "animate-kenburns" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
            <span
              className="h-16 w-16 rounded-full shadow-inner ring-2 ring-surface"
              style={{ background: swatch }}
            />
            <span className="font-script text-base text-foreground/60">
              photo coming soon
            </span>
          </div>
        )}
        {children}
      </div>

      <span className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 rounded-sm bg-sunshine/90 shadow-sm" />
      {caption && (
        <span className="absolute bottom-1.5 left-3 font-script text-base text-foreground/70">
          {caption}
        </span>
      )}
    </motion.div>
  );
}
