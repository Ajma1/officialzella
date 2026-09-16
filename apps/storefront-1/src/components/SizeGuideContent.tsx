"use client";

import { useState } from "react";
import { toDisplayUnits } from "@/lib/units";
import type { Size } from "@/data/catalog.seed";

// PLACEHOLDER measurements — generic relaxed-fit womenswear. See PLACEHOLDER_DATA.md.
const COLS = ["Chest", "Waist", "Hip", "Length"] as const;
const SIZE_CHART_CM: Record<Size, Record<(typeof COLS)[number], number>> = {
  XS: { Chest: 92, Waist: 74, Hip: 98, Length: 66 },
  S: { Chest: 96, Waist: 78, Hip: 102, Length: 67 },
  M: { Chest: 100, Waist: 82, Hip: 106, Length: 68 },
  L: { Chest: 105, Waist: 87, Hip: 111, Length: 69 },
  XL: { Chest: 110, Waist: 92, Hip: 116, Length: 70 },
};
const SIZES = Object.keys(SIZE_CHART_CM) as Size[];

const STEPS = [
  ["Chest", "Measure around the fullest part, keeping the tape level."],
  ["Waist", "Measure around your natural waistline — the narrowest point."],
  ["Hip", "Stand feet together and measure around the fullest part."],
  ["Length", "From the highest point of the shoulder straight down."],
];

export default function SizeGuideContent({ className = "" }: { className?: string }) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");

  return (
    <div className={className}>
      <p className="font-script text-xl text-foreground/80">
        Zella is cut roomy — if you like a closer fit, size down.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/60">
          Units
        </span>
        <div className="flex rounded-full bg-surface-warm p-0.5">
          {(["cm", "in"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              data-cursor-label={u.toUpperCase()}
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                unit === u ? "bg-cherry text-surface" : "text-foreground/60 hover:text-cherry"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[14px] bg-surface-warm">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-[0.1em] text-foreground/60">
              <th scope="col" className="px-4 py-3">Size</th>
              {COLS.map((c) => (
                <th key={c} scope="col" className="px-4 py-3">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size) => (
              <tr key={size} className="border-t border-foreground/10">
                <th scope="row" className="px-4 py-3 text-left font-bold text-foreground">
                  {size}
                </th>
                {COLS.map((c) => (
                  <td key={c} className="px-4 py-3 text-foreground/80">
                    {toDisplayUnits(SIZE_CHART_CM[size][c], unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        Measurements are a guide and will be confirmed with real garment specs.
      </p>

      <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
        How to measure
      </h3>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <svg
          viewBox="0 0 80 120"
          className="h-40 w-28 shrink-0 text-foreground/70"
          aria-hidden
        >
          <path
            d="M40 8a7 7 0 100 14 7 7 0 000-14zM26 26h28l6 24-8 3-2-14v34H30V39l-2 14-8-3 6-24zM31 73h18l3 39H28l3-39z"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <line x1="16" y1="34" x2="64" y2="34" stroke="var(--cherry)" strokeWidth={2} strokeDasharray="3 3" />
          <line x1="20" y1="50" x2="60" y2="50" stroke="var(--cherry)" strokeWidth={2} strokeDasharray="3 3" />
          <line x1="18" y1="70" x2="62" y2="70" stroke="var(--cherry)" strokeWidth={2} strokeDasharray="3 3" />
        </svg>
        <ol className="flex-1 space-y-3">
          {STEPS.map(([label, text]) => (
            <li key={label} className="text-sm text-foreground/80">
              <span className="font-bold text-foreground">{label}. </span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
