import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found — Zella" };

export default function NotFound() {
  return (
    <section className="container-narrow" style={{ padding: "96px 28px 120px", textAlign: "center" }}>
      <p className="kicker">404</p>
      <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 14px" }}>
        This page wandered off.
      </h1>
      <p style={{ maxWidth: "44ch", margin: "0 auto 32px", fontSize: 15, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist — let&rsquo;s get you back to the edit.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </section>
  );
}
