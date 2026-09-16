"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { SparkleIcon } from "@/components/icons";

/**
 * The rotated cherry badge that surfaces a supplementary tag (season, promo,
 * low stock). Replaces a kicker/eyebrow line — this world never puts one above
 * a heading. Idle-floats unless `float` is false.
 */
export default function StickerBadge({
  note,
  children,
  rotate = -8,
  float = true,
  icon = true,
  size = "md",
  className = "",
}: {
  note?: string;
  children?: ReactNode;
  rotate?: number;
  float?: boolean;
  icon?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const dims = size === "sm" ? "h-16 w-16 gap-0" : "h-24 w-24 gap-0.5";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 10 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: "spring", stiffness: 160, damping: 12 }}
      style={
        {
          "--float-rot": `${rotate}deg`,
          "--float-rot-alt": `${rotate + 4}deg`,
        } as React.CSSProperties
      }
      className={`${float ? "animate-float" : ""} flex ${dims} flex-col items-center justify-center rounded-full bg-cherry text-center text-surface shadow-xl shadow-background-deep/40 ${className}`}
    >
      {icon && (
        <SparkleIcon
          size={size === "sm" ? 12 : 16}
          className={float ? "animate-sparkle" : undefined}
        />
      )}
      {note && (
        <span
          className={`font-script leading-none ${size === "sm" ? "text-sm" : "text-xl"}`}
        >
          {note}
        </span>
      )}
      {children && (
        <span
          className={`font-bold uppercase tracking-[0.1em] ${size === "sm" ? "text-[8px]" : "text-[10px]"}`}
        >
          {children}
        </span>
      )}
    </motion.div>
  );
}
