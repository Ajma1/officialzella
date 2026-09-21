import type { Metadata } from "next";
import { getApprovedFeedback } from "@zella/core/feedback";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = { title: "Feedback — Zella" };

export default async function FeedbackPage() {
  const feedback = await getApprovedFeedback();

  return (
    <section className="container-narrow" style={{ padding: "50px 28px 76px" }}>
      <p className="kicker">Tell us</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 14px" }}>Feedback</h1>
      <p style={{ maxWidth: "48ch", margin: "0 0 42px", fontSize: 15, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        Good or bad, we want to hear it. A member of the team reads every note before it goes up here.
      </p>

      <FeedbackForm />

      {feedback.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, margin: "0 0 20px" }}>What people are saying</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {feedback.map((f) => (
              <div key={f.id} style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: 16, letterSpacing: "0.05em" }}>
                  {"★".repeat(f.rating)}
                  {"☆".repeat(5 - f.rating)}
                </p>
                <p style={{ margin: "0 0 8px", fontSize: 15, lineHeight: 1.65 }}>{f.message}</p>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
                  {f.name || "Verified customer"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
