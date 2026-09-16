export function toDisplayUnits(cm: number, unit: "cm" | "in"): string {
  return unit === "in" ? (cm / 2.54).toFixed(1) : String(Math.round(cm));
}
