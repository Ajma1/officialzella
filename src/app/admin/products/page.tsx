import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-cherry px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          No products yet. Add your first one.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {product.images[0] && (
                  <Image
                    src={product.images[0].url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-neutral-500">
                  {product.category.toLowerCase()}
                  {product.colorway ? ` · ${product.colorway}` : ""}
                </p>
              </div>
              <p className="text-sm tabular-nums text-neutral-700">
                {formatCents(product.priceCents)}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  product.active
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {product.active ? "Active" : "Hidden"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
