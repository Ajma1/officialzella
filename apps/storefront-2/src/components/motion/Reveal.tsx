"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Fades + lifts content into view — the one registration point for the
 *  site's reveal motion, so every animated block shares one ScrollTrigger
 *  setup instead of each section hand-rolling its own. Skips the animation
 *  entirely (renders the final state immediately) under
 *  prefers-reduced-motion, per gsap.matchMedia. */
export default function Reveal({
  children,
  y = 22,
  duration = 0.7,
  delay = 0,
  stagger,
  immediate = false,
  className,
  style,
}: {
  children: ReactNode;
  y?: number;
  duration?: number;
  delay?: number;
  /** Animates direct children individually instead of the wrapper as one block. */
  stagger?: number;
  /** Plays on mount instead of on scroll — for above-the-fold content (hero). */
  immediate?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger !== undefined ? Array.from(el.children) : el;
        gsap.from(targets, {
          opacity: 0,
          y,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
