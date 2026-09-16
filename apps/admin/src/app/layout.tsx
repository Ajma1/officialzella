import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zella Admin",
  description: "Order and inventory management for Zella — internal use only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
