import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import Polaroid from "@/components/Polaroid";
import SiteButton from "@/components/SiteButton";

export const metadata: Metadata = {
  title: "Our Story — Zella",
  description:
    "Zella makes relaxed, breathable cotton shirts and trousers — roomy where it counts, made for girls who don't sit still.",
};

/* TODO(copy): every paragraph below is PLACEHOLDER. PRODUCT.md forbids inventing
   founder names, dates, or history — replace with the real brand story. See
   PLACEHOLDER_DATA.md. */
const SECTIONS = [
  {
    heading: "Where it started",
    body: "Zella began with one frustration: everyday clothes that looked relaxed on the hanger and then pulled tight the moment you actually moved in them. So we started over from the fabric — soft, breathable cotton — and a fit built around movement first.",
    image: { src: "/shirt-lilac.jpg", tag: "Lilac", align: "right" as const },
  },
  {
    heading: "The fit philosophy",
    body: "Roomy where it counts. Our shirts sit easy through the shoulder and body; our trousers move with you all day. Nothing clings, nothing rides up, nothing asks you to hold still for it.",
    image: { src: "/shirt-mocha-stripe.jpg", tag: "Mocha stripe", align: "left" as const },
  },
  {
    heading: "One edit at a time",
    body: "We don't chase every trend. Each season is a small, considered edit of cotton shirts and trousers in colourways we actually want to wear — made to layer, made to last, made to come back to.",
    image: { src: "/shirt-burgundy.jpg", tag: "Burgundy", align: "right" as const },
  },
];

const VALUES = ["100% cotton", "relaxed fit", "shirts & trousers", "for girls who move"];

export default function OurStoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-12 sm:pt-16">
        <PageHeading accent="story." sub="Loose cotton, made to move — and the thinking behind it.">
          Our story.
        </PageHeading>

        <div className="mt-12 space-y-12 sm:space-y-14">
          {SECTIONS.map((section) => (
            <section
              key={section.heading}
              className={`flex flex-col gap-6 sm:items-start sm:gap-10 ${
                section.image.align === "left" ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              <div className="w-full max-w-48 shrink-0 self-center sm:self-start">
                <Polaroid
                  src={section.image.src}
                  alt={`Zella ${section.image.tag} cotton shirt`}
                  caption={section.image.tag}
                  rotate={section.image.align === "left" ? -4 : 4}
                />
              </div>
              <div className="flex-1 sm:pt-2">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  {section.heading}
                </h2>
                <p className="mt-3 leading-relaxed text-foreground">{section.body}</p>
              </div>
            </section>
          ))}
        </div>

        <blockquote className="mt-16 text-center font-script text-2xl text-cherry sm:text-3xl">
          &ldquo;Made for girls who don&rsquo;t sit still.&rdquo;
        </blockquote>

        <div className="mt-14 rounded-[18px] bg-surface p-6 text-center shadow-lg shadow-background-deep/15">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
            What we stand for
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-bold uppercase tracking-[0.12em] text-cherry">
            {VALUES.map((v, i) => (
              <li key={v} className="flex items-center gap-4">
                {v}
                {i < VALUES.length - 1 && <span className="text-foreground/30">·</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 text-center">
          <SiteButton href="/shirts" label="Shop">
            Shop the edit
          </SiteButton>
        </div>
    </main>
  );
}
