import { SHOP_UTC_OFFSET } from "@/lib/shop-timezone";

export type DashboardRange = "today" | "7d" | "30d" | "all";

const DAYS_BACK: Record<Exclude<DashboardRange, "all">, number> = {
  today: 0,
  "7d": 6,
  "30d": 29,
};

/** Converts a dashboard range selector into UTC instant bounds, anchored to
 *  the shop's PKT calendar day (not the server's UTC day) — "today" means
 *  the shop's today. `end` is always null (open-ended through now); "all"
 *  returns both bounds null (no date filter at all). `now` is injectable
 *  for tests; defaults to the real current time. */
export function rangeToDates(
  range: DashboardRange,
  now: Date = new Date(),
): { start: Date | null; end: Date | null } {
  if (range === "all") return { start: null, end: null };

  const shopUtcOffsetMs = 5 * 60 * 60 * 1000;
  const shopToday = new Date(now.getTime() + shopUtcOffsetMs).toISOString().slice(0, 10);

  const start = new Date(`${shopToday}T00:00:00${SHOP_UTC_OFFSET}`);
  start.setUTCDate(start.getUTCDate() - DAYS_BACK[range]);

  return { start, end: null };
}
