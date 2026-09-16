"use client";

import { useActionState, useState, type KeyboardEvent, type ReactNode } from "react";
import { COUNTRIES } from "@zella/core/checkout";
import { requestPin, verifyPin } from "@zella/core/actions";

type Errors = Record<string, string> | undefined;

function Field({ name, label, errors, children }: { name: string; label: string; errors: Errors; children?: ReactNode }) {
  const error = errors?.[name];
  return (
    <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span>{label}</span>
      {children ?? <input id={name} name={name} className="input" aria-invalid={error ? "true" : undefined} />}
      {error && <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{error}</span>}
    </label>
  );
}

function EmailField({ errors }: { errors: Errors }) {
  const [email, setEmail] = useState("");
  const [reqState, reqAction, reqPending] = useActionState(requestPin, undefined);
  const [verState, verAction, verPending] = useActionState(verifyPin, undefined);
  const isVerified = verState?.ok === true && verState.email === email;
  const showCode = reqState?.ok === true && reqState.email === email && !isVerified;
  const stopEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span>Email</span>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={stopEnter}
          readOnly={isVerified}
          className="input"
          style={{ flex: 1 }}
          aria-invalid={errors?.email ? "true" : undefined}
        />
        {!isVerified && (
          <button type="submit" formAction={reqAction} disabled={reqPending || !email} className="btn btn-secondary" style={{ flexShrink: 0 }}>
            {reqPending ? "Sending…" : showCode ? "Resend" : "Send code"}
          </button>
        )}
      </div>
      {isVerified && <span style={{ fontSize: 12, color: "var(--color-accent-700)" }}>Verified ✓</span>}
      {reqState?.ok === false && <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{reqState.error}</span>}
      {showCode && !isVerified && (
        <div style={{ display: "flex", gap: 8 }}>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" onKeyDown={stopEnter} className="input" style={{ flex: 1 }} />
          <button type="submit" formAction={verAction} disabled={verPending} className="btn btn-primary" style={{ flexShrink: 0 }}>
            {verPending ? "Verifying…" : "Verify"}
          </button>
        </div>
      )}
      {verState?.ok === false && <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{verState.error}</span>}
      {errors?.email && <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{errors.email}</span>}
    </label>
  );
}

export default function CheckoutForm({ errors }: { errors: Errors }) {
  const [shipToDifferent, setShipToDifferent] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errors && Object.keys(errors).length > 0 && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: "var(--color-accent-800)" }}>
          Please fix the highlighted fields.
        </p>
      )}

      <Field name="fullName" label="Full name" errors={errors} />
      <Field name="phone" label="Phone" errors={errors} />
      <EmailField errors={errors} />
      <Field name="line1" label="Street address" errors={errors} />
      <Field name="line2" label="Apartment, suite (optional)" errors={errors} />
      <div className="grid-2">
        <Field name="city" label="City" errors={errors} />
        <Field name="state" label="State / region (optional)" errors={errors} />
      </div>
      <div className="grid-2">
        <Field name="postalCode" label="Postal code (optional)" errors={errors} />
        <Field name="country" label="Country" errors={errors}>
          <select id="country" name="country" defaultValue={COUNTRIES[0]} className="input">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
        <input type="checkbox" name="shipToDifferent" checked={shipToDifferent} onChange={(e) => setShipToDifferent(e.target.checked)} />
        Ship to someone else
      </label>
      {shipToDifferent && <Field name="recipientName" label="Recipient's name" errors={errors} />}

      <Field name="notes" label="Anything we should know? (optional)" errors={errors}>
        <textarea id="notes" name="notes" rows={3} className="input" style={{ resize: "vertical" }} />
      </Field>

      <div style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 20 }}>
        <p style={{ margin: "0 0 6px", fontFamily: "var(--font-heading)", fontSize: 18 }}>Cash on delivery</p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
          Pay the courier when your order arrives.
        </p>
      </div>
    </div>
  );
}
