import CategoryRows from "@/components/CategoryRows";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <CategoryRows />
    </main>
  );
}
