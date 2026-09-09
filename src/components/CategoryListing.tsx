import Link from "next/link";
import type { Category } from "@/data/catalog.seed";
import { getProductsByCategory } from "@/lib/catalog";
import { sortProducts, type SortKey } from "@/lib/catalog.helpers";
import { categoryMeta } from "@/lib/categories";
import PageHeading from "@/components/PageHeading";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";
import { HeartIcon } from "@/components/icons";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "New" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
];

function resolveSort(raw?: string): SortKey {
  return SORTS.some((s) => s.key === raw) ? (raw as SortKey) : "new";
}

export default async function CategoryListing({
  category,
  sort,
}: {
  category: Category;
  sort?: string;
}) {
  const meta = categoryMeta(category);
  const activeSort = resolveSort(sort);
  const products = sortProducts(await getProductsByCategory(category), activeSort);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-10 sm:pt-16 lg:px-16">
      <PageHeading accent="." sub={meta.blurb}>
        {`${meta.name}.`}
      </PageHeading>

      {products.length === 0 ? (
        <EmptyState
          sticker={<HeartIcon size={40} className="text-cherry" />}
          heading="Nothing pinned here yet."
          note="check back soon — this edit is still coming together"
          action={
            <SiteButton href="/" label="Home">
              Back to the edit
            </SiteButton>
          }
        />
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-foreground/15 pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
              {products.length} {products.length === 1 ? "style" : "styles"}
            </p>
            <div
              role="group"
              aria-label="Sort products"
              className="flex items-center gap-1.5"
            >
              {SORTS.map((s) => {
                const active = s.key === activeSort;
                return (
                  <Link
                    key={s.key}
                    href={s.key === "new" ? meta.href : `${meta.href}?sort=${s.key}`}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    data-cursor-label="Sort"
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "bg-cherry text-surface"
                        : "bg-surface-warm text-foreground/70 hover:text-cherry"
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-12">
            <ProductGrid products={products} />
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/lookbook"
              data-cursor-label="View"
              className="inline-flex items-center gap-1.5 font-script text-xl text-foreground/70 transition-colors hover:text-cherry"
            >
              see the lookbook
              <HeartIcon size={16} />
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
