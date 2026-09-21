/** Zella operates out of Pakistan (PKT, UTC+5 year-round — no DST), so every
 *  "day boundary" in admin (order filters, dashboard date ranges) anchors to
 *  this fixed offset instead of the server's local clock (UTC on Vercel) —
 *  otherwise "today" means the server's today, not the shop's. */
export const SHOP_UTC_OFFSET = "+05:00";
const SHOP_UTC_OFFSET_MS = 5 * 60 * 60 * 1000;

/** The shop-local (PKT) calendar date a UTC instant falls on, as YYYY-MM-DD —
 *  used to bucket orders into daily totals. */
export function shopDateKey(date: Date): string {
  return new Date(date.getTime() + SHOP_UTC_OFFSET_MS).toISOString().slice(0, 10);
}
