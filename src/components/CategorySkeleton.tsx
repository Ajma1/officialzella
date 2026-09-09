/** Polaroid-shaped shimmer shown while a listing page's data resolves.
 *  Ready for tomorrow's DB latency; near-instant against the seed today. */
export default function CategorySkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-10 sm:pt-16 lg:px-16">
      <div className="h-14 w-56 animate-pulse rounded-2xl bg-surface-warm" />
      <div className="mt-5 h-5 w-80 max-w-full animate-pulse rounded-full bg-surface-warm" />
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="animate-pulse rounded-[18px] bg-surface p-2.5 pb-6 shadow-lg shadow-background-deep/20">
              <div className="aspect-[4/5] w-full rounded-[10px] bg-surface-warm" />
            </div>
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-surface-warm" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-surface-warm" />
          </div>
        ))}
      </div>
    </main>
  );
}
