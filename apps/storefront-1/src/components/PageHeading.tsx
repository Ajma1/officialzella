import type { ReactNode } from "react";
import Squiggle from "@/components/Squiggle";

/**
 * The one big display headline per page or major section — Bagel Fat One, with
 * an optional accent substring rendered in cherry with a hand-drawn underline.
 * (DESIGN.md One-Display-Face: Bagel is reserved for this; sub-headings use Fredoka.)
 */
export default function PageHeading({
  children,
  accent,
  sub,
  className = "",
}: {
  children: string;
  accent?: string;
  sub?: ReactNode;
  className?: string;
}) {
  const [before, after] = accent && children.includes(accent)
    ? [children.slice(0, children.indexOf(accent)), children.slice(children.indexOf(accent) + accent.length)]
    : [children, ""];

  return (
    <div className={className}>
      <h1 className="font-display text-5xl font-normal leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        {before}
        {accent && (
          <span className="relative inline-block text-cherry">
            {accent}
            <Squiggle />
          </span>
        )}
        {after}
      </h1>
      {sub && (
        <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  );
}
