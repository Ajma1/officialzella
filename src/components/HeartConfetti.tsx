"use client";

import { motion, useReducedMotion } from "motion/react";
import { HeartIcon } from "@/components/icons";

const PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 97) % 100}%`,
  delay: (i % 5) * 0.12,
  drift: (i % 2 ? 1 : -1) * (20 + (i % 4) * 14),
  rotate: (i % 2 ? 1 : -1) * (120 + i * 8),
  size: 12 + (i % 3) * 6,
  color: i % 3 === 0 ? "text-cherry" : i % 3 === 1 ? "text-sunshine" : "text-grape",
}));

/** One-shot celebration burst. Fully suppressed under prefers-reduced-motion. */
export default function HeartConfetti() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute top-0 ${p.color}`}
          style={{ left: p.left }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: 260, x: p.drift, opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeIn" }}
        >
          <HeartIcon size={p.size} />
        </motion.span>
      ))}
    </div>
  );
}
