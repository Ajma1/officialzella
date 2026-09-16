"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@zella/core/cart";

const NAV_LINKS = [
  { label: "Shirts", href: "/shirts" },
  { label: "Trousers", href: "/trousers" },
  { label: "Pair", href: "/pair" },
  { label: "Our Story", href: "/our-story" },
  { label: "Account", href: "/account" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", gap: 30, padding: "15px 28px" }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 25,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "var(--color-text)",
            marginRight: "auto",
          }}
        >
          Zella
        </Link>

        <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  paddingBottom: 4,
                  borderBottom: `1px solid ${active ? "var(--color-accent)" : "transparent"}`,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/cart" className="btn btn-secondary" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Bag {count > 0 ? `(${count})` : ""}
        </Link>
      </div>
    </header>
  );
}
