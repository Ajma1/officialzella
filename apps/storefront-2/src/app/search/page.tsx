import { searchProducts } from "@zella/core/catalog";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const results = query ? await searchProducts(query) : [];

  return (
    <section className="container" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">Search</p>
      <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: "0 0 34px" }}>
        {query ? `Results for “${query}”` : "Search"}
      </h1>
      <form action="/search" style={{ marginBottom: 34, maxWidth: 400 }}>
        <input name="q" defaultValue={query} placeholder="Search shirts, colourways…" className="input" />
      </form>
      {query && results.length === 0 && <p className="text-muted">Nothing matched that search.</p>}
      <div className="grid-products">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
