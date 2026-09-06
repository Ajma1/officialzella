import Link from "next/link";
import { BowIcon, InstagramIcon, TikTokIcon } from "@/components/icons";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Shirts", href: "/shirts" },
      { label: "Trousers", href: "/trousers" },
      { label: "Bundles", href: "/bundles" },
      { label: "Lookbook", href: "/lookbook" },
    ],
  },
  {
    title: "About",
    links: [{ label: "Our Story", href: "/our-story" }],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/size-guide" },
      { label: "Search", href: "/search" },
      // PLACEHOLDER — real contact page needed (PLACEHOLDER_DATA.md)
      { label: "Contact", href: "#" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-dashed border-foreground/15 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <span className="flex items-center gap-1.5 font-display text-2xl text-foreground">
              Zella
              <BowIcon size={16} className="translate-y-[-2px] text-cherry" />
            </span>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.15em] text-foreground/70">
              Loose Cotton, Made to Move
            </p>
            <div className="mt-5 flex gap-3">
              {/* PLACEHOLDER — real social URLs needed (PLACEHOLDER_DATA.md) */}
              <a
                href="#"
                aria-label="Instagram"
                data-cursor-label="Follow"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-foreground/80 transition-colors hover:bg-cherry hover:text-surface"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                data-cursor-label="Follow"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-foreground/80 transition-colors hover:bg-cherry hover:text-surface"
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-14">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                  {col.title}
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-foreground/75">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        data-cursor-label="View"
                        className="transition-colors hover:text-cherry"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t-2 border-dashed border-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-script text-lg text-foreground/60">
            made for girls who don&rsquo;t sit still
          </p>
          <p className="text-xs text-foreground/60">
            © {new Date().getFullYear()} Zella ·{" "}
            {/* PLACEHOLDER — real legal pages needed */}
            <a href="#" className="hover:text-cherry">
              Privacy
            </a>{" "}
            ·{" "}
            <a href="#" className="hover:text-cherry">
              Terms
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
