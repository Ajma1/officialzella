"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@zella/core/catalog-types";
import { useCart, useCartUi } from "@zella/core/cart";
import { PAIR_PRICE_CENTS } from "@zella/core/checkout";
import Polaroid from "@/components/Polaroid";
import PriceTag from "@/components/PriceTag";
import SiteButton from "@/components/SiteButton";
import StickerBadge from "@/components/StickerBadge";

const SIZES = ["S", "M"] as const;

function PickerRow({
  label,
  items,
  selectedId,
  onPick,
  aspect,
}: {
  label: string;
  items: Product[];
  selectedId: string;
  onPick: (id: string) => void;
  aspect: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              aria-pressed={selected}
              data-cursor-label="Pick"
              className="flex flex-col items-center gap-1.5 text-left"
            >
              <div
                className={`w-full overflow-hidden rounded-[10px] transition-opacity ${
                  selected ? "opacity-100 ring-2 ring-cherry" : "opacity-70 hover:opacity-100"
                }`}
                style={{ aspectRatio: aspect }}
              >
                {item.images[0]?.url ? (
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    width={160}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: item.colorwaySwatch }}
                  />
                )}
              </div>
              <span
                className={`truncate text-xs font-semibold ${
                  selected ? "text-cherry" : "text-foreground/70"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PairBuilder({
  shirts,
  trousers,
}: {
  shirts: Product[];
  trousers: Product[];
}) {
  const { add } = useCart();
  const { open: openCart } = useCartUi();
  const [shirtId, setShirtId] = useState(shirts[0]?.id ?? "");
  const [trouserId, setTrouserId] = useState(trousers[0]?.id ?? "");
  const [size, setSize] = useState<(typeof SIZES)[number]>("S");
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);

  const shirt = shirts.find((p) => p.id === shirtId) ?? shirts[0];
  const trouser = trousers.find((p) => p.id === trouserId) ?? trousers[0];

  if (!shirt || !trouser) {
    return (
      <p className="font-script text-lg text-foreground/60">
        Photography is still being shot for enough pieces to build a pair —
        check back soon.
      </p>
    );
  }

  const wasCents = shirt.priceCents + trouser.priceCents;

  function handleAdd() {
    add({
      productId: shirt.id,
      slug: shirt.slug,
      name: shirt.name,
      colorway: shirt.colorway,
      image: shirt.images[0]?.url ?? null,
      size,
      priceCents: PAIR_PRICE_CENTS,
      pair: {
        productId: trouser.id,
        slug: trouser.slug,
        name: trouser.name,
        image: trouser.images[0]?.url ?? null,
      },
    });
    setAdded(true);
    openCart();
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div className="flex flex-col gap-8">
        <PickerRow label="Pick a shirt" items={shirts} selectedId={shirt.id} onPick={setShirtId} aspect="4 / 5" />
        <PickerRow label="Pick a trouser" items={trousers} selectedId={trouser.id} onPick={setTrouserId} aspect="5 / 8" />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            Pick a size
          </p>
          <div className="mt-3 flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                data-cursor-label={s}
                className={`flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-bold transition-colors ${
                  size === s
                    ? "bg-cherry text-surface"
                    : "bg-surface-warm text-foreground/80 hover:text-cherry"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="relative rounded-[18px] bg-surface p-5 shadow-lg shadow-background-deep/15 sm:p-6 lg:sticky lg:top-28">
        <div className="absolute -right-3 -top-4 z-20">
          <StickerBadge note="2-in-1" rotate={8}>
            deal
          </StickerBadge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Polaroid
            src={shirt.images[0]?.url}
            alt={shirt.name}
            swatch={shirt.colorwaySwatch}
            rotate={-2}
            hover={false}
            aspect="4 / 5"
          />
          <Polaroid
            src={trouser.images[0]?.url}
            alt={trouser.name}
            swatch={trouser.colorwaySwatch}
            rotate={2}
            hover={false}
            aspect="4 / 5"
          />
        </div>

        <p className="mt-5 font-display text-xl leading-tight text-foreground">
          {shirt.name} + {trouser.name}
        </p>

        <div className="mt-4">
          <PriceTag priceCents={PAIR_PRICE_CENTS} compareAtCents={wasCents} coinKey={`${shirt.id}-${trouser.id}`} />
        </div>

        <p className="mt-4 font-script text-base text-foreground/60">
          Size {size} · cash on delivery
        </p>

        <div className="mt-5">
          <SiteButton label="Add pair to bag" onClick={handleAdd} arrow={false} className="w-full">
            {added ? "Added ♥" : "Add pair to bag"}
          </SiteButton>
        </div>
      </aside>
    </div>
  );
}
