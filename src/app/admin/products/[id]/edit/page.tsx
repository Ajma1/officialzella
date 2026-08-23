import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";
import { deleteProduct, updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit product</h1>
        <form
          action={async () => {
            "use server";
            await deleteProduct(product.id);
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete product
          </button>
        </form>
      </div>

      <div className="mt-6">
        <ProductForm
          action={boundUpdate}
          submitLabel="Save changes"
          initial={{
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            colorway: product.colorway ?? "",
            priceCents: product.priceCents,
            active: product.active,
            images: product.images.map((img) => ({
              id: img.id,
              url: img.url,
            })),
          }}
        />
      </div>
    </div>
  );
}
