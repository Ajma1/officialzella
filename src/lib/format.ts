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

// PLACEHOLDER currency — no market stated in PRODUCT.md. See PLACEHOLDER_DATA.md.
const CURRENCY_SYMBOL = "$";

export function formatPrice(cents: number) {
  return `${CURRENCY_SYMBOL}${formatCents(cents)}`;
}
