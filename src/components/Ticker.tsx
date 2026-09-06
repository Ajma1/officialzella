import { HeartIcon } from "@/components/icons";

/** Signature charm-bracelet marquee — a seamless loop of product facts in bold
 *  cherry label type, hearts between. Confirmed copy (PRODUCT.md). Rendered
 *  globally above the footer. */
const TICKER_ITEMS = [
  "100% cotton",
  "relaxed fit",
  "shirts & trousers",
  "for girls who move",
  "new season",
];

export default function Ticker() {
  return (
    <div className="relative z-10 overflow-hidden border-t-4 border-surface/40 bg-surface py-4">
      <div className="flex w-max animate-marquee gap-10">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center gap-10 pr-10" aria-hidden={rep === 1}>
            {TICKER_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-10 whitespace-nowrap text-sm font-bold uppercase tracking-[0.25em] text-cherry"
              >
                {item}
                <HeartIcon size={14} className="text-foreground/40" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
