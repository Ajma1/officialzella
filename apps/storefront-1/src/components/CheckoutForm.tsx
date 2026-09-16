"use client";

import { useActionState, useState, type KeyboardEvent, type ReactNode } from "react";
import { COUNTRIES } from "@zella/core/checkout";
import { requestPin, verifyPin } from "@zella/core/actions";

type Errors = Record<string, string> | undefined;

function Field({
  name,
  label,
  errors,
  children,
  hint,
}: {
  name: string;
  label: string;
  errors: Errors;
  children?: ReactNode;
  hint?: string;
}) {
  const error = errors?.[name];
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-[0.12em] text-foreground/70"
      >
        {label}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          className="field mt-1.5"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
      )}
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-foreground/55">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Checkout's email field doubles as a PIN-verification widget: send a code,
 *  enter it, and the field locks — placeOrder rejects any email that wasn't
 *  verified this way in this session. */
function EmailField({ errors }: { errors: Errors }) {
  const [email, setEmail] = useState("");
  const [reqState, reqAction, reqPending] = useActionState(requestPin, undefined);
  const [verState, verAction, verPending] = useActionState(verifyPin, undefined);
  // Derived, not effect-synced state: a send/verify response only counts for
  // the email it was issued for, so editing the field after either action
  // naturally drops back to the "not verified / no code sent yet" state.
  const isVerified = verState?.ok === true && verState.email === email;
  const showCode = reqState?.ok === true && reqState.email === email && !isVerified;
  const stopEnterSubmit = (e: KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <div>
      <label
        htmlFor="email"
        className="block text-xs font-bold uppercase tracking-[0.12em] text-foreground/70"
      >
        Email
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={stopEnterSubmit}
          readOnly={isVerified}
          className="field flex-1"
          aria-invalid={errors?.email ? "true" : undefined}
        />
        {!isVerified && (
          <button
            type="submit"
            formAction={reqAction}
            disabled={reqPending || !email}
            className="shrink-0 rounded-full border-2 border-cherry px-3 text-xs font-bold text-cherry transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {reqPending ? "Sending…" : showCode ? "Resend" : "Send code"}
          </button>
        )}
      </div>

      {isVerified && (
        <p className="mt-1 text-xs font-semibold text-cherry">Verified ✓</p>
      )}
      {reqState?.ok === false && (
        <p className="mt-1 text-xs font-semibold text-danger">{reqState.error}</p>
      )}

      {showCode && !isVerified && (
        <div className="mt-2 flex gap-2">
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            onKeyDown={stopEnterSubmit}
            className="field flex-1"
          />
          <button
            type="submit"
            formAction={verAction}
            disabled={verPending}
            className="shrink-0 rounded-full bg-cherry px-3 text-xs font-bold text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {verPending ? "Verifying…" : "Verify"}
          </button>
        </div>
      )}
      {verState?.ok === false && (
        <p className="mt-1 text-xs font-semibold text-danger">{verState.error}</p>
      )}
      {errors?.email && (
        <p className="mt-1 text-xs font-semibold text-danger">{errors.email}</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[18px] bg-surface p-5 shadow-lg shadow-background-deep/15 sm:p-6">
      <legend className="px-1 text-sm font-bold text-foreground">{title}</legend>
      <div className="mt-3 space-y-4">{children}</div>
    </fieldset>
  );
}

export default function CheckoutForm({ errors }: { errors: Errors }) {
  const [shipToDifferent, setShipToDifferent] = useState(false);

  return (
    <div className="space-y-5">
      {errors && Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="rounded-[14px] border-2 border-danger/50 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger"
        >
          Please fix the highlighted fields.
        </div>
      )}

      <Card title="Contact">
        <Field name="fullName" label="Full name" errors={errors} />
        <Field name="phone" label="Phone" errors={errors} hint="We'll call to confirm delivery." />
        <EmailField errors={errors} />
      </Card>

      <Card title="Shipping address">
        <Field name="line1" label="Street address" errors={errors} />
        <Field name="line2" label="Apartment, suite (optional)" errors={errors} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="city" label="City" errors={errors} />
          <Field name="state" label="State / region (optional)" errors={errors} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="postalCode" label="Postal code (optional)" errors={errors} />
          <Field name="country" label="Country" errors={errors}>
            <select id="country" name="country" defaultValue={COUNTRIES[0]} className="field mt-1.5">
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 pt-1 text-sm text-foreground/80">
          <input
            type="checkbox"
            name="shipToDifferent"
            checked={shipToDifferent}
            onChange={(e) => setShipToDifferent(e.target.checked)}
            className="h-4 w-4 accent-cherry"
          />
          Ship to someone else
        </label>
        {shipToDifferent && (
          <Field name="recipientName" label="Recipient's name" errors={errors} />
        )}
      </Card>

      <Card title="Order notes">
        <Field name="notes" label="Anything we should know? (optional)" errors={errors}>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Gate code, delivery instructions…"
            className="field mt-1.5 resize-none"
          />
        </Field>
      </Card>

      <div className="rounded-[18px] border-2 border-cherry/60 bg-cherry/5 p-5 sm:p-6">
        <p className="text-sm font-bold text-foreground">Cash on Delivery</p>
        <p className="mt-1 text-sm text-foreground/70">
          Pay when it arrives. Have the total ready in cash — our courier will call
          before delivery.
        </p>
      </div>
    </div>
  );
}
