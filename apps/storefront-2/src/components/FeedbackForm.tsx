"use client";

import { useActionState } from "react";
import { submitFeedback, type SubmitFeedbackState } from "@zella/core/actions";

const initialState: SubmitFeedbackState = undefined;

export default function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)", padding: 24 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 20 }}>Thank you.</p>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
          We read every note — yours will show up here once we&rsquo;ve had a look.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Honeypot — visually hidden, never seen or filled by a real visitor. */}
      <label
        htmlFor="companyWebsite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        Leave this field empty
        <input id="companyWebsite" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span>Rating</span>
        <select name="rating" defaultValue="5" className="input" required>
          <option value="5">★★★★★ — Excellent</option>
          <option value="4">★★★★☆ — Good</option>
          <option value="3">★★★☆☆ — Okay</option>
          <option value="2">★★☆☆☆ — Not great</option>
          <option value="1">★☆☆☆☆ — Poor</option>
        </select>
      </label>

      <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span>Name (optional)</span>
        <input name="name" type="text" className="input" />
      </label>

      <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span>Email (optional, kept private)</span>
        <input name="email" type="email" className="input" aria-invalid={fieldErrors?.email ? "true" : undefined} />
        {fieldErrors?.email && (
          <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{fieldErrors.email}</span>
        )}
      </label>

      <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span>Order number (optional)</span>
        <input name="orderNumber" type="text" placeholder="ZELLA-XXXXX" className="input" />
      </label>

      <label className="field" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span>Your feedback</span>
        <textarea
          name="message"
          rows={4}
          required
          className="input"
          style={{ resize: "vertical" }}
          aria-invalid={fieldErrors?.message ? "true" : undefined}
        />
        {fieldErrors?.message && (
          <span style={{ fontSize: 12, color: "var(--color-accent-800)" }}>{fieldErrors.message}</span>
        )}
      </label>

      {fieldErrors && Object.entries(fieldErrors).some(([k]) => k !== "email" && k !== "message") && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: "var(--color-accent-800)" }}>
          Please check your entries and try again.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary" style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
