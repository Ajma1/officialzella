import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { coinFor } from "@/lib/coins";

function discountPct(price: number, was: number) {
  return Math.round((1 - price / was) * 100);
}

/**
 * The prominent price, styled as a coquette hangtag — a cream tag hanging from a
 * short string with a real Pakistani coin as the charm (echoing the site's
 * charm-bracelet ticker). Shows a struck-through "was" price + a saving pill
 * when `compareAtCents` is set.
 */
export default function PriceTag({
  priceCents,
  compareAtCents,
  coinKey,
  size = "lg",
}: {
  priceCents: number;
  compareAtCents?: number;
  coinKey: string;
  size?: "md" | "lg";
}) {
  const onSale = typeof compareAtCents === "number" && compareAtCents > priceCents;
  const coin = coinFor(coinKey);
  const big = size === "lg";

  return (
    <div className="relative inline-flex flex-col items-start">
      {/* string + coin charm */}
      <div className="relative ml-6 flex flex-col items-center">
        <span className="h-4 w-px bg-foreground/30" />
        <span className="relative h-7 w-7 -rotate-6 overflow-hidden rounded-full ring-2 ring-surface shadow-sm">
          <Image src={coin.src} alt={coin.label} fill sizes="28px" className="object-cover" />
        </span>
      </div>

      <div className="-mt-1 flex items-center gap-3 rounded-[16px] bg-surface px-4 py-2.5 shadow-lg shadow-background-deep/20">
        <span
          className={`font-display leading-none text-cherry ${big ? "text-3xl sm:text-4xl" : "text-2xl"}`}
        >
          {formatPrice(priceCents)}
        </span>
        {onSale && (
          <span className="flex flex-col items-start">
            <span className="text-xs font-semibold text-foreground/50 line-through decoration-foreground/40">
              was {formatPrice(compareAtCents!)}
            </span>
            <span className="mt-0.5 rounded-full bg-cherry px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-surface">
              save {discountPct(priceCents, compareAtCents!)}%
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
