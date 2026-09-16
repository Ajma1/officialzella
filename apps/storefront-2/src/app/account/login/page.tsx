"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestPin, verifyPin } from "@zella/core/actions";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reqState, reqAction, reqPending] = useActionState(requestPin, undefined);
  const [verState, verAction, verPending] = useActionState(verifyPin, undefined);
  const showCode = reqState?.ok === true && reqState.email === email;

  useEffect(() => {
    if (verState?.ok) router.push("/account");
  }, [verState, router]);

  return (
    <main className="container-narrow" style={{ padding: "80px 28px" }}>
      <p className="kicker">Sign in</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 12px" }}>Your account.</h1>
      <p style={{ margin: "0 0 34px", fontSize: 15, lineHeight: 1.6, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        We&rsquo;ll email you a 6-digit code — no password needed.
      </p>

      <form action={showCode ? verAction : reqAction} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 360 }}>
        <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span>Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={showCode}
            className="input"
          />
        </label>

        {showCode && (
          <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span>6-digit code</span>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus className="input" />
          </label>
        )}

        {reqState?.ok === false && <p style={{ margin: 0, fontSize: 13, color: "var(--color-accent-800)" }}>{reqState.error}</p>}
        {verState?.ok === false && <p style={{ margin: 0, fontSize: 13, color: "var(--color-accent-800)" }}>{verState.error}</p>}

        <button type="submit" disabled={reqPending || verPending} className="btn btn-primary btn-block" style={{ padding: 14, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          {showCode ? (verPending ? "Verifying…" : "Verify") : reqPending ? "Sending…" : "Send code"}
        </button>

        {showCode && (
          <button type="submit" formAction={reqAction} className="btn btn-ghost" style={{ fontSize: 12 }}>
            Resend code
          </button>
        )}
      </form>
    </main>
  );
}
