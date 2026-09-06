import Link from "next/link";
import type { ReactNode } from "react";
import PageHeading from "@/components/PageHeading";
import Polaroid from "@/components/Polaroid";
import { CATEGORIES } from "@/lib/categories";

/**
 * The shared coquette empty / dead-end surface — empty cart, empty category,
 * no search results, 404, missing confirmation. Sticker + display headline +
 * handwritten note + an action, with an optional row of the three categories
 * as mini Polaroids.
 */
export default function EmptyState({
  sticker,
  heading,
  accent,
  note,
  action,
  showCategories = false,
}: {
  sticker: ReactNode;
  heading: string;
  accent?: string;
  note: string;
  action?: ReactNode;
  showCategories?: boolean;
}) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center sm:py-28">
      <div className="mb-6">{sticker}</div>
      <PageHeading accent={accent}>{heading}</PageHeading>
      <p className="mt-4 font-script text-xl text-foreground/70">{note}</p>
      {action && <div className="mt-8">{action}</div>}

      {showCategories && (
        <ul className="mt-14 flex flex-wrap justify-center gap-6">
          {CATEGORIES.map((c, i) => (
            <li key={c.category}>
              <Link
                href={c.href}
                data-cursor-label="View"
                className="group block w-28 sm:w-32"
              >
                <Polaroid
                  src={c.sampleImage ?? undefined}
                  swatch={c.swatch}
                  caption={c.name}
                  rotate={[-4, 3, -2][i % 3]}
                  aspect="1 / 1"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
