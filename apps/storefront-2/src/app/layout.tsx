import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartUiProvider } from "@zella/core/cart";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Zella — Clothes for girls who move",
  description:
    "Button-down shirts and wide-leg trousers, cut with room to move.",
};

// ponytail: force-dynamic means every request hits Postgres for the catalog
// read — fine at current traffic, and the only way admin edits show up
// without a rebuild (two separate Vercel projects can't share a build-time
// cache). If/when traffic makes this measurably slow, upgrade to
// `"use cache"` + `cacheTag("catalog")` on packages/core/src/catalog.ts's
// functions, plus a secret-signed revalidate webhook admin calls after
// every product/inventory write.
export const dynamic = "force-dynamic";

/*
  THESIS: same brand, same catalog, same checkout — a second visual world for
  the A/B test, deliberately unlike storefront-1's coquette dream-board.
  OWN-WORLD: "Classical" — editorial and book-like. Paper-white ground, ink
  text, one bronze/gold accent used only as stroke (outlined buttons, hairline
  rules, underlines) never as a fill. Cormorant Garamond headings over Lora
  body. Photos sit matted like tipped-in book plates (sepia-toned .plate
  treatment), not cropped banners.
  STORY: a shopper lands on a quiet, confident page that reads like a
  lookbook page from a print magazine, browses shirts and trousers styled
  as "the shirt" / "the trouser" rather than a grid of SKUs, and can build a
  discounted shirt+trouser pair in one unbroken flow.
  FIRST VIEWPORT: sticky blurred nav bar, kicker + serif display headline +
  one-line subhead + two outlined CTAs, two overlapping plated photos.
  FORM: editorial direction, following the brief's own Classical design
  system verbatim (tokens, component classes) rather than introducing a new
  language.
*/
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable}`}>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <CartUiProvider>
          <SiteHeader />
          <div style={{ flex: 1 }}>{children}</div>
          <SiteFooter />
        </CartUiProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
