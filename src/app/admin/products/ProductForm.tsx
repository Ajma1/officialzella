"use client";

import Image from "next/image";
import { useActionState } from "react";
import type { FormState } from "./actions";
import { deleteProductImage } from "./actions";
import { formatCents } from "@/lib/format";

type ExistingImage = { id: string; url: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  category: "SHIRT" | "TROUSER" | "BUNDLE";
  colorway: string;
  priceCents: number;
  active: boolean;
  images: ExistingImage[];
};

const CATEGORY_OPTIONS: { value: ProductFormValues["category"]; label: string }[] = [
  { value: "SHIRT", label: "Shirt" },
  { value: "TROUSER", label: "Trouser" },
  { value: "BUNDLE", label: "Bundle" },
];

export default function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial?: ProductFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initial?.name}
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? "SHIRT"}
            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              initial ? formatCents(initial.priceCents) : undefined
            }
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
          />
        </div>
      </div>

      <div>
        <label htmlFor="colorway" className="block text-sm font-medium">
          Colorway (optional)
        </label>
        <input
          id="colorway"
          name="colorway"
          defaultValue={initial?.colorway}
          placeholder="e.g. Burgundy"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4 rounded border-neutral-300 text-cherry focus:ring-cherry"
        />
        <label htmlFor="active" className="text-sm">
          Visible on the storefront
        </label>
      </div>

      {initial?.images && initial.images.length > 0 && (
        <div>
          <p className="text-sm font-medium">Current images</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {initial.images.map((img) => (
              <div key={img.id} className="group relative h-20 w-20">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    deleteProductImage(img.id, initial.id!)
                  }
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="images" className="block text-sm font-medium">
          {initial ? "Add images" : "Images"}
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="mt-1 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-neutral-200"
        />
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
