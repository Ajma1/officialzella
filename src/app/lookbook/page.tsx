import type { Metadata } from "next";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import Polaroid from "@/components/Polaroid";
import { CATEGORIES } from "@/lib/categories";
import { BowIcon, HeartIcon, SparkleIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Lookbook — Zella",
  description: "The current cotton edit — shirts and trousers, shot on the day.",
};

const SHOTS = [
  { src: "/shirt-sky-stripe.jpg", tag: "Sky stripe", slug: "sky-stripe-shirt", rotate: -3, aspect: "4 / 5" },
  { src: "/shirt-burgundy.jpg", tag: "Burgundy", slug: "burgundy-shirt", rotate: 3, aspect: "1 / 1" },
  { src: "/shirt-lilac.jpg", tag: "Lilac", slug: "lilac-shirt", rotate: -2, aspect: "3 / 4" },
  { src: "/shirt-mocha-stripe.jpg", tag: "Mocha stripe", slug: "mocha-stripe-shirt", rotate: 2.5, aspect: "4 / 5" },
  { src: "/shirt-yellow-stripe.jpg", tag: "Butter stripe", slug: "butter-stripe-shirt", rotate: -3.5, aspect: "1 / 1" },
  { src: "/shirt-blue-stripe.jpg", tag: "Denim stripe", slug: "denim-stripe-shirt", rotate: 3, aspect: "3 / 4" },
];

export default function LookbookPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute right-6 top-24 hidden text-cherry sm:block"
      >
        <BowIcon size={30} />
      </div>
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-2 top-1/2 hidden text-cherry/70 lg:block"
        style={{ animationDelay: "1.2s" }}
      >
        <SparkleIcon size={22} className="animate-sparkle" />
      </div>

      <PageHeading accent="." sub="The current cotton edit — shot on the day. Tap a piece to shop it.">
        Lookbook.
      </PageHeading>

      <div className="mt-12 columns-1 gap-8 sm:columns-2 lg:columns-3">
        {SHOTS.map((shot) => (
          <Link
            key={shot.slug}
            href={`/products/${shot.slug}`}
            data-cursor-label="Shop this"
            className="group mb-8 block break-inside-avoid"
          >
            <Polaroid
              src={shot.src}
              alt={`Zella ${shot.tag} cotton shirt`}
              caption={shot.tag}
              rotate={shot.rotate}
              aspect={shot.aspect}
              kenburns
            >
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-2 rounded-full bg-cherry px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-surface opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                Shop this
              </span>
            </Polaroid>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        <span className="font-script text-xl text-foreground/70">shop the edit</span>
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.category}
            href={c.href}
            data-cursor-label="View"
            className="block w-24 sm:w-28"
          >
            <Polaroid
              src={c.sampleImage ?? undefined}
              swatch={c.swatch}
              caption={c.name}
              rotate={[-4, 3, -2][i % 3]}
              aspect="1 / 1"
            />
          </Link>
        ))}
      </div>

      <div aria-hidden className="mt-10 flex justify-center text-cherry/40">
        <HeartIcon size={18} />
      </div>
    </main>
  );
}
