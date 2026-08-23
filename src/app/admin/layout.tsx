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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display text-lg">
            Zella Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-neutral-600">
            <Link
              href="/admin/products"
              className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
            >
              Orders
            </Link>
            <span className="mx-2 h-4 w-px bg-neutral-200" />
            <span className="px-2 text-neutral-400">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-neutral-900"
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
