"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestPin, verifyPin } from "@zella/core/actions";
import PageHeading from "@/components/PageHeading";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reqState, reqAction, reqPending] = useActionState(requestPin, undefined);
  const [verState, verAction, verPending] = useActionState(verifyPin, undefined);
  // A send/verify response only counts for the email it was issued for, so
  // editing the field afterward naturally drops back to "no code sent yet".
  const showCode = reqState?.ok === true && reqState.email === email;

  useEffect(() => {
    if (verState?.ok) router.push("/account");
  }, [verState, router]);

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <PageHeading accent="in.">Sign in.</PageHeading>
      <p className="mt-3 font-script text-lg text-foreground/70">
        we&rsquo;ll email you a 6-digit code — no password needed
      </p>

      <form action={showCode ? verAction : reqAction} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-[0.12em] text-foreground/70"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={showCode}
            className="field mt-1.5"
          />
        </div>

        {showCode && (
          <div>
            <label
              htmlFor="code"
              className="block text-xs font-bold uppercase tracking-[0.12em] text-foreground/70"
            >
              6-digit code
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              className="field mt-1.5"
            />
          </div>
        )}

        {reqState?.ok === false && (
          <p className="text-sm font-semibold text-danger">{reqState.error}</p>
        )}
        {verState?.ok === false && (
          <p className="text-sm font-semibold text-danger">{verState.error}</p>
        )}

        <button
          type="submit"
          disabled={reqPending || verPending}
          className="h-12 w-full rounded-full bg-cherry text-sm font-bold text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {showCode
            ? verPending
              ? "Verifying…"
              : "Verify"
            : reqPending
              ? "Sending…"
              : "Send code"}
        </button>

        {showCode && (
          <button
            type="submit"
            formAction={reqAction}
            className="w-full min-h-11 flex items-center justify-center text-center text-xs font-semibold text-foreground/60 underline decoration-dashed underline-offset-2 hover:text-cherry"
          >
            Resend code
          </button>
        )}
      </form>
    </main>
  );
}
