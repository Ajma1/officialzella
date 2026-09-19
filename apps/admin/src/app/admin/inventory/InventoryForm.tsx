"use client";

import { useActionState } from "react";
import { updateInventory } from "./actions";

type Variant = { id: string; size: string; stock: number };
type Row = {
  id: string;
  sku: string;
  name: string;
  category: string;
  colorway: string | null;
  active: boolean;
  variants: Variant[];
};

function StatusBadge({ total }: { total: number }) {
  const label = total === 0 ? "Out of stock" : total <= 10 ? "Low stock" : "In stock";
  const style =
    total === 0
      ? "bg-red-100 text-red-700"
      : total <= 10
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>{label}</span>
  );
}

export default function InventoryForm({ products }: { products: Row[] }) {
  const [state, formAction, pending] = useActionState(updateInventory, undefined);

  return (
    <form action={formAction}>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              {products[0]?.variants.map((v) => (
                <th key={v.size} className="px-4 py-3 text-center">
                  {v.size}
                </th>
              ))}
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const total = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-neutral-500">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{p.name}</p>
                    <p className="text-xs text-neutral-500">
                      {p.category.toLowerCase()}
                      {p.colorway ? ` · ${p.colorway}` : ""}
                      {!p.active && " · hidden"}
                    </p>
                  </td>
                  {p.variants.map((v) => (
                    <td key={v.id} className="px-4 py-2 text-center">
                      <input
                        type="number"
                        name={`stock_${v.id}`}
                        defaultValue={v.stock}
                        min="0"
                        step="1"
                        className="min-h-11 w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-600">
                    {total}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge total={total} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-11 items-center rounded-lg bg-cherry px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save inventory"}
        </button>
        {state?.saved && <span className="text-sm text-green-700">Saved.</span>}
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
