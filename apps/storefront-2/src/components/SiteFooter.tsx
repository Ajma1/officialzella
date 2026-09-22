import Link from "next/link";

const SHOP_LINKS = [
  { label: "Shirts", href: "/shirts" },
  { label: "Trousers", href: "/trousers" },
  { label: "Make a pair", href: "/pair" },
  { label: "Lookbook", href: "/lookbook" },
];

const GOOD_TO_KNOW = [
  "Cash on delivery, nationwide.",
  "Ships in 2–5 days.",
  "Considered fabrics · relaxed fit · machine wash cold.",
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/officialzella.pk" },
  { label: "WhatsApp", href: "https://wa.me/923345636909" },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-divider)", background: "var(--color-surface)", marginTop: "auto" }}>
      <div
        className="container grid-footer"
        style={{ padding: "50px 28px 42px" }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Zella
          </p>
          <p style={{ margin: 0, maxWidth: "32ch", fontSize: 13, lineHeight: 1.65, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
            Relaxed fits for girls who don&rsquo;t sit still.
          </p>
        </div>

        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px", color: "color-mix(in srgb, var(--color-text) 58%, transparent)" }}>
            Shop
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start" }}>
            {SHOP_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "flex", alignItems: "center", minHeight: 44, fontSize: 13, color: "var(--color-text)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px", color: "color-mix(in srgb, var(--color-text) 58%, transparent)" }}>
            Good to know
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {GOOD_TO_KNOW.map((note) => (
              <p key={note} style={{ margin: 0, fontSize: 13, color: "color-mix(in srgb, var(--color-text) 74%, transparent)" }}>
                {note}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 14px", color: "color-mix(in srgb, var(--color-text) 58%, transparent)" }}>
            Get in touch
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start" }}>
            {SOCIAL_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", minHeight: 44, fontSize: 13, color: "var(--color-text)" }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--color-divider)" }}>
        <p className="container" style={{ padding: "16px 28px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
          Zella
        </p>
      </div>
    </footer>
  );
}
