import type { Metadata } from "next";
import { Bagel_Fat_One, Caveat, Fredoka } from "next/font/google";
import { MotionConfig } from "motion/react";
import CustomCursor from "@/components/CustomCursor";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Ticker from "@/components/Ticker";
import CartDrawer from "@/components/CartDrawer";
import { CartUiProvider } from "@/lib/cart/cart-ui";
import "./globals.css";

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: ["400"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Zella — Loose Cotton, Made to Move",
  description:
    "Zella makes relaxed, breathable cotton shirts and trousers for girls — soft fabric, room to move, made for every day.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bagel.variable} ${fredoka.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/*
          THESIS: Zella's comfort-first loose-cotton positioning becomes a coquette
          clothing-aesthetic world (bows, ribbons, taped Polaroids), refusing the
          quiet-luxury cream/serif ecommerce default this page shipped with before.
          OWN-WORLD: drenched hot-pink ground, cream Polaroid cards, cherry-red CTAs,
          chunky bubble display (Bagel Fat One) + rounded Fredoka body + Caveat script
          accents, ribbon dividers, floating bow/heart/sparkle stickers.
          STORY: an 18-24 shopper lands, reads "built for me" in one glance, sees real
          product photos framed like taped Polaroids, taps into the cotton edit.
          FIRST VIEWPORT: pill nav on pink ground; chunky headline + ribbon-tag badge +
          CTA left; tilted Polaroid photo stack right; charm-bracelet ticker footer.
          FORM: coquette dream-board direction, user-steered toward product fit over
          the assigned rave-flyer roll; seed key bc9c4725.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the
          finish review, the verdict, DESIGN.md, and every shipping raster carrying
          its provenance.
        */}
        <MotionConfig reducedMotion="user">
          <CartUiProvider>
            <CustomCursor />
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <Ticker />
            <SiteFooter />
            <CartDrawer />
          </CartUiProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
