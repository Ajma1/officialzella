import ProductForm from "../ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">New product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} submitLabel="Create product" />
      </div>
    </div>
  );
}
