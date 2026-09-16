export function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parsePriceCents(raw: FormDataEntryValue | null) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatCents(cents: number) {
  return (cents / 100).toFixed(2);
}

// Currency: Pakistani Rupee. `cents` are paisa (Rs × 100); retail prices are
// whole rupees, so we render "Rs 2,990" with no decimals. See PLACEHOLDER_DATA.md.
export function formatPrice(cents: number) {
  const rupees = Math.round(cents / 100);
  return `Rs ${rupees.toLocaleString("en-US")}`;
}
