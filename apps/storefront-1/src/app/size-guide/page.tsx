import type { Metadata } from "next";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import SizeGuideContent from "@/components/SizeGuideContent";

export const metadata: Metadata = {
  title: "Size guide — Zella",
  description: "How Zella's relaxed-fit cotton sizing works, plus a measurement guide.",
};

export default function SizeGuidePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:pt-16">
      <Link
        href="/shirts"
        data-cursor-label="Back"
        className="font-script text-lg text-foreground/60 transition-colors hover:text-cherry"
      >
        ← back to shopping
      </Link>
      <div className="mt-4">
        <PageHeading accent=".">Size guide.</PageHeading>
      </div>
      <SizeGuideContent className="mt-8" />
    </main>
  );
}
