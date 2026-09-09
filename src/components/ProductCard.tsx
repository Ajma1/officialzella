import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog.seed";
import { isSoldOut } from "@/lib/catalog.helpers";
import { formatPrice } from "@/lib/format";
import { coinFor } from "@/lib/coins";
import Polaroid from "@/components/Polaroid";

const REST_ROTATIONS = [-1.5, 1, -1, 1.5, -0.5];

export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const soldOut = isSoldOut(product);
  const image = product.images[0]?.url;
  const onSale =
    typeof product.compareAtCents === "number" &&
    product.compareAtCents > product.priceCents;
  const coin = coinFor(product.id);

  return (
    <Link
      href={`/products/${product.slug}`}
      data-cursor-label="View"
      className="group relative block"
      aria-label={`${product.name}${product.colorway ? `, ${product.colorway}` : ""} — ${formatPrice(product.priceCents)}${soldOut ? " (sold out)" : ""}`}
    >
      {product.isNew && !soldOut && (
        <span className="absolute -left-1.5 -top-2 z-20 -rotate-6 rounded-full bg-cherry px-2.5 py-0.5 font-script text-sm font-semibold text-surface shadow-md shadow-cherry/30">
          new
        </span>
      )}

      <Polaroid
        src={image}
        alt={image ? `${product.name}, ${product.colorway ?? "flat lay"}` : ""}
        swatch={product.colorwaySwatch}
        caption={product.colorway ?? undefined}
        rotate={REST_ROTATIONS[index % REST_ROTATIONS.length]}
      >
        {soldOut && (
          <>
            <span className="absolute inset-0 bg-surface/45" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-full border-2 border-foreground/70 bg-surface/90 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Sold out
            </span>
          </>
        )}
      </Polaroid>

      {onSale && !soldOut && (
        <span className="absolute -right-2 bottom-16 z-20 h-9 w-9 rotate-6 overflow-hidden rounded-full ring-2 ring-surface shadow-md shadow-background-deep/30 sm:bottom-20">
          <Image src={coin.src} alt={coin.label} fill sizes="36px" className="object-cover" />
        </span>
      )}

      <div className="mt-3 px-1">
        <h3 className="font-semibold text-foreground transition-colors duration-150 group-hover:text-cherry">
          {product.name}
        </h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold tabular-nums text-cherry">
            {formatPrice(product.priceCents)}
          </span>
          {onSale && (
            <span className="text-xs tabular-nums text-foreground/45 line-through decoration-foreground/40">
              {formatPrice(product.compareAtCents!)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
