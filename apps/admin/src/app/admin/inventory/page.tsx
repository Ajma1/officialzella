import { prisma } from "@zella/db";
import InventoryForm from "./InventoryForm";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: { variants: { orderBy: { size: "asc" } } },
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-xl font-semibold">Inventory</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Stock per size, across every product. Hidden products stay listed here so you can
        restock before switching them back on.
      </p>

      <div className="mt-6">
        <InventoryForm products={products} />
      </div>
    </div>
  );
}
