"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-50 px-6">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl text-neutral-900">
          Zella Admin
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to continue.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-cherry focus:ring-1 focus:ring-cherry"
            />
          </div>
        </div>

        {state?.error && (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-cherry py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
