import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The login page renders its own standalone shell.
  if (!user) return children;

  return (
    <div className="min-h-svh bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
          <Link href="/admin" className="inline-flex min-h-11 items-center font-display text-lg">
            Zella Admin
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-neutral-600 sm:ml-auto">
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Orders
            </Link>
            <Link
              href="/admin/inventory"
              className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Inventory
            </Link>
            <span className="mx-1 hidden h-4 w-px bg-neutral-200 sm:block" />
            <span className="hidden px-2 text-neutral-400 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-neutral-100 hover:text-neutral-900"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
