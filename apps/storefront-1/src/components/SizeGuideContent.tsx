"use client";

import { useState } from "react";
import { toDisplayUnits } from "@zella/core/units";

/** Real Zella garment-spec measurements (inches), S/M only — matches the
 *  brand's own size chart reference exactly. Stored here as inches (the
 *  source unit) and converted to cm on demand for the unit toggle, via the
 *  shared cm-based `toDisplayUnits` helper (inches -> cm once, so both
 *  toggle states stay exact). */
type Value = number | [number, number];

/** toDisplayUnits always shows one decimal in inches (e.g. "28.0") — trim a
 *  trailing ".0" so whole numbers match the brand's own size chart exactly
 *  (28, not 28.0), while real decimals like 10.5 are left untouched. */
const trimTrailingZero = (s: string) => s.replace(/\.0$/, "");

function formatValue(value: Value, unit: "cm" | "in"): string {
  if (Array.isArray(value)) {
    const [lo, hi] = value;
    return `${trimTrailingZero(toDisplayUnits(lo * 2.54, unit))}–${trimTrailingZero(toDisplayUnits(hi * 2.54, unit))}`;
  }
  return trimTrailingZero(toDisplayUnits(value * 2.54, unit));
}

const SHIRT_IN: { label: string; S: Value; M: Value }[] = [
  { label: "Front Length", S: 28, M: 28 },
  { label: "Back Length", S: 29, M: 29 },
  { label: "Shoulder", S: 19, M: 21 },
  { label: "Chest", S: 21, M: 23 },
  { label: "Arm Hole", S: 9, M: 10.5 },
  { label: "Sleeve Length (Including Cuffs)", S: 22, M: 22 },
  { label: "Cuff Breadth", S: 3, M: 3 },
  { label: "Cuff Length", S: 10.5, M: 11.5 },
  { label: "Collar", S: 16, M: 17 },
];

const TROUSER_IN: { label: string; S: Value; M: Value }[] = [
  { label: "Waist", S: [29, 31], M: [31, 33] },
  { label: "Length", S: 37, M: 37 },
  { label: "Bottom Width", S: 11, M: 11 },
];

function SizeTable({
  title,
  rows,
  unit,
}: {
  title: string;
  rows: { label: string; S: Value; M: Value }[];
  unit: "cm" | "in";
}) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">{title}</h3>
      <div className="mt-3 overflow-x-auto rounded-[14px] bg-surface-warm">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-[0.1em] text-foreground/60">
              <th scope="col" className="px-4 py-3">Measurement</th>
              <th scope="col" className="px-4 py-3 text-right">Small</th>
              <th scope="col" className="px-4 py-3 text-right">Medium</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-foreground/10">
                <th scope="row" className="px-4 py-3 text-left font-bold text-foreground">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-right text-foreground/80">
                  {formatValue(row.S, unit)}
                  {unit === "in" ? "″" : ""}
                </td>
                <td className="px-4 py-3 text-right text-foreground/80">
                  {formatValue(row.M, unit)}
                  {unit === "in" ? "″" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuideContent({ className = "" }: { className?: string }) {
  const [unit, setUnit] = useState<"cm" | "in">("in");

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
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              data-cursor-label={u.toUpperCase()}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                unit === u ? "bg-cherry text-surface" : "text-foreground/60 hover:text-cherry"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <SizeTable title="Shirt" rows={SHIRT_IN} unit={unit} />
      <SizeTable title="Trouser" rows={TROUSER_IN} unit={unit} />

      <p className="mt-3 text-xs text-foreground/50">
        Small and Medium only. Measurements may vary slightly by ±0.5 inch.
      </p>
    </div>
  );
}
