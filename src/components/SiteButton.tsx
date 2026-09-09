"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { ArrowIcon } from "@/components/icons";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary";

const BASE: Record<Variant, string> = {
  primary:
    "group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-cherry px-6 text-sm font-bold text-surface shadow-lg shadow-cherry/30 transition-colors duration-150 hover:bg-cherry-bright disabled:opacity-60 disabled:pointer-events-none",
  secondary:
    "inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-foreground/40 px-4 py-2.5 font-script text-lg font-semibold text-foreground transition-colors duration-150 hover:border-cherry hover:text-cherry",
};

interface Props {
  variant?: Variant;
  href?: string;
  label: string;
  magnetic?: boolean;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function SiteButton({
  variant = "primary",
  href,
  label,
  magnetic = variant === "primary",
  arrow = variant === "primary",
  children,
  className = "",
  onClick,
  disabled,
  type = "button",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent) => {
    if (!magnetic) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.3,
      y: (e.clientY - rect.top - rect.height / 2) * 0.4,
    });
  };
  const reset = () => setPos({ x: 0, y: 0 });

  const motionProps = {
    "data-cursor-label": label,
    onMouseMove: handleMove,
    onMouseLeave: reset,
    animate: { x: pos.x, y: pos.y },
    transition: { type: "spring" as const, stiffness: 150, damping: 12, mass: 0.4 },
    whileHover: disabled ? undefined : { scale: 1.05 },
    whileTap: disabled ? undefined : { scale: 0.93 },
    className: `${BASE[variant]} ${className}`,
  };

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <MotionLink
        ref={ref as ComponentProps<typeof MotionLink>["ref"]}
        href={href}
        onClick={onClick}
        {...motionProps}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      ref={ref as ComponentProps<typeof motion.button>["ref"]}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
