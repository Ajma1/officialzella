import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/catalog";
import PageHeading from "@/components/PageHeading";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import SearchField from "@/components/SearchField";
import { SparkleIcon, HeartIcon } from "@/components/icons";

const QUICK_SEARCHES = ["Sky", "Lilac", "Burgundy", "Mocha", "Denim", "Trousers"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `“${q}” — Search — Zella` : "Search — Zella",
    robots: { index: false },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:pt-16">
        <PageHeading>Search.</PageHeading>
        <p className="mt-4 font-script text-xl text-foreground/70">
          what are you after?
        </p>
        <div className="mt-8">
          <SearchField autoFocus />
        </div>
        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
            Popular
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((term) => (
              <li key={term}>
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  data-cursor-label="Search"
                  className="inline-block rounded-full bg-surface-warm px-4 py-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-cherry hover:text-surface"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  const results = await searchProducts(query);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-10 sm:pt-16 lg:px-16">
      <PageHeading accent={query}>{`results for ${query}`}</PageHeading>

      <div className="mt-8 max-w-xl">
        <SearchField defaultValue={query} />
      </div>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            sticker={<SparkleIcon size={40} className="text-cherry" />}
            heading={`Nothing matched “${query}”`}
            note="try a colourway, or browse the full edit"
            showCategories
          />
        </div>
      ) : (
        <>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </p>
          <div className="mt-8">
            <ProductGrid products={results} />
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
