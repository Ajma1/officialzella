"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Product, Size } from "@/data/catalog.seed";
import { canAddToCart, isSoldOut, variantStock } from "@/lib/catalog.helpers";
import { categoryMeta } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart/useCart";
import { useCartUi } from "@/lib/cart/cart-ui";
import Polaroid from "@/components/Polaroid";
import SiteButton from "@/components/SiteButton";
import StickerBadge from "@/components/StickerBadge";
import ProductCard from "@/components/ProductCard";
import Drawer from "@/components/Drawer";
import SizeGuideContent from "@/components/SizeGuideContent";
import { CloseIcon } from "@/components/icons";

const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL"];
const LOW_STOCK = 4;

export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { add } = useCart();
  const { open: openCart } = useCartUi();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addedTimer = useRef<number | undefined>(undefined);

  const soldOut = isSoldOut(product);
  const parent = categoryMeta(product.category);
  const selectedStock = size ? variantStock(product, size) : 0;
  const maxQty = Math.min(selectedStock || 10, 10);
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
  const lowStock = !soldOut && totalStock > 0 && totalStock <= LOW_STOCK;

  function chooseSize(s: Size) {
    setSize(s);
    setError(null);
    setQty((q) => Math.min(q, Math.max(1, variantStock(product, s))));
  }

  function handleAdd() {
    const check = canAddToCart(product, size, qty);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorway: product.colorway,
        image: product.images[0]?.url ?? null,
        size: size!,
        priceCents: product.priceCents,
      },
      qty,
    );
    setError(null);
    setAdded(true);
    openCart();
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2500);
  }

  const activeSrc = product.images[activeImage]?.url;

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:px-10 lg:px-16">
      <Link
        href={parent.href}
        data-cursor-label="Back"
        className="font-script text-lg text-foreground/60 transition-colors hover:text-cherry"
      >
        ← all {parent.name.toLowerCase()}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Imagery */}
        <div>
          <div className="relative mx-auto max-w-md lg:mx-0">
            {(product.isNew || lowStock) && (
              <div className="absolute -right-3 -top-4 z-20">
                <StickerBadge note={lowStock ? "few" : "new"} rotate={8}>
                  {lowStock ? "left" : "season"}
                </StickerBadge>
              </div>
            )}
            <Polaroid
              src={activeSrc}
              alt={activeSrc ? `${product.name}, ${product.colorway ?? "flat lay"}` : ""}
              swatch={product.colorwaySwatch}
              caption={product.colorway ?? undefined}
              rotate={-2}
              kenburns={Boolean(activeSrc)}
              priority
              hover={false}
            />
          </div>

          {product.images.length > 1 && (
            <div className="mt-5 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImage}
                  data-cursor-label="View"
                  className={`w-20 shrink-0 rounded-[12px] transition-opacity ${
                    i === activeImage ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Polaroid src={img.url} rotate={i % 2 ? 3 : -3} hover={false} aspect="1 / 1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-4">
          <h1 className="font-display leading-[0.95] tracking-tight text-foreground text-[clamp(2rem,6vw,3.25rem)]">
            {product.name}
          </h1>

          <p className="mt-3 text-xl tabular-nums text-foreground">
            {formatPrice(product.priceCents)}
          </p>

          {product.colorway && (
            <div className="mt-4 flex items-center gap-2.5">
              <span
                className="h-6 w-6 rounded-full ring-2 ring-surface"
                style={{ background: product.colorwaySwatch }}
              />
              <span className="text-sm font-semibold text-foreground/80">
                {product.colorway}
              </span>
            </div>
          )}

          <p className="mt-5 leading-relaxed text-foreground">{product.description}</p>

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Size
              </span>
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                data-cursor-label="Open"
                className="font-script text-base text-foreground/60 underline decoration-dashed underline-offset-4 transition-colors hover:text-cherry"
              >
                size guide
              </button>
            </div>
            <div role="group" aria-label="Size" className="mt-3 flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => {
                const stock = variantStock(product, s);
                const out = stock === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={out}
                    onClick={() => chooseSize(s)}
                    aria-pressed={size === s}
                    data-cursor-label={out ? "Sold out" : s}
                    className={`relative flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold transition-colors ${
                      size === s
                        ? "bg-cherry text-surface"
                        : out
                          ? "bg-surface-warm text-foreground/30"
                          : "bg-surface-warm text-foreground/80 hover:text-cherry"
                    }`}
                  >
                    {s}
                    {out && (
                      <>
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-foreground/40"
                        />
                        <span className="sr-only"> (sold out)</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {error && (
              <p className="mt-2 text-sm font-semibold text-danger" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Quantity + add */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full bg-surface-warm">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1 || soldOut}
                aria-label="Decrease quantity"
                data-cursor-label="Less"
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-foreground/70 disabled:opacity-40 hover:text-cherry"
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty || soldOut}
                aria-label="Increase quantity"
                data-cursor-label="More"
                className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-foreground/70 disabled:opacity-40 hover:text-cherry"
              >
                +
              </button>
            </div>

            <SiteButton
              label="Add to bag"
              onClick={handleAdd}
              disabled={soldOut}
              arrow={false}
              className="min-w-44 flex-1"
            >
              {soldOut ? "Sold out" : added ? "Added ♥" : "Add to bag"}
            </SiteButton>
            <span aria-live="polite" className="sr-only">
              {added ? `${product.name} added to your bag` : ""}
            </span>
          </div>

          <p className="mt-4 font-script text-base text-foreground/60">
            Cash on delivery · roomy fit — size down if you&rsquo;re between
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-dashed border-foreground/15 pt-4 text-xs font-bold uppercase tracking-[0.12em] text-foreground/60">
            <li>100% cotton</li>
            <li>·</li>
            <li>relaxed fit</li>
            <li>·</li>
            <li>machine wash cold</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-lg font-semibold text-foreground">You might also like</h2>
          <ul className="mt-6 flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:max-w-2xl sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
            {related.map((p, i) => (
              <li key={p.id} className="w-40 shrink-0 snap-start sm:w-auto">
                <ProductCard product={p} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Drawer open={guideOpen} onClose={() => setGuideOpen(false)} side="right" label="Size guide">
        <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/15 px-5 py-4">
          <h2 className="font-display text-2xl text-foreground">Size guide</h2>
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            aria-label="Close size guide"
            data-cursor-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <SizeGuideContent />
        </div>
      </Drawer>
    </main>
  );
}
