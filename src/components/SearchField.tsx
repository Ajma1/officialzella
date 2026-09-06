import { SearchIcon } from "@/components/icons";

/** Plain GET form — works without JS. Used on the /search page for refining. */
export default function SearchField({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/search" method="get" className="flex items-center gap-2">
      <div className="relative flex-1">
        <SearchIcon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50"
        />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          placeholder="Search shirts, colourways…"
          aria-label="Search products"
          className="field !rounded-full !pl-11"
        />
      </div>
      <button
        type="submit"
        data-cursor-label="Search"
        className="shrink-0 rounded-full bg-cherry px-5 py-3 text-sm font-bold text-surface transition-colors hover:bg-cherry-bright"
      >
        Search
      </button>
    </form>
  );
}
