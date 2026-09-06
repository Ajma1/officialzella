"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagIcon, BowIcon, CloseIcon, SearchIcon } from "@/components/icons";

const NAV_LINKS = [
  { label: "Shirts", href: "/shirts" },
  { label: "Trousers", href: "/trousers" },
  { label: "Bundles", href: "/bundles" },
  { label: "Our Story", href: "/our-story" },
  { label: "Lookbook", href: "/lookbook" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    setSearchOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6 lg:px-14">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full bg-surface/95 py-2.5 pl-5 pr-2.5 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? "shadow-xl shadow-background-deep/25" : "shadow-lg shadow-background-deep/15"
        }`}
      >
        <Link
          href="/"
          data-cursor-label="Home"
          className="flex shrink-0 items-center gap-1.5 font-display text-2xl tracking-tight text-foreground"
        >
          Zella
          <BowIcon size={16} className="translate-y-[-2px] text-cherry" />
        </Link>

        {searchOpen ? (
          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2">
            <input
              ref={searchRef}
              name="q"
              type="search"
              placeholder="Search shirts, colourways…"
              aria-label="Search products"
              className="field !rounded-full !py-2"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              data-cursor-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-warm hover:text-cherry"
            >
              <CloseIcon size={18} />
            </button>
          </form>
        ) : (
          <nav className="hidden items-center gap-1 text-sm font-semibold text-foreground/80 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor-label="View"
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 transition-colors duration-150 hover:bg-surface-warm hover:text-cherry ${
                    active ? "bg-surface-warm text-cherry" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          {!searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              data-cursor-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-surface-warm hover:text-cherry"
            >
              <SearchIcon size={20} />
            </button>
          )}

          <Link
            href="/cart"
            data-cursor-label="Bag"
            aria-label="Shopping bag"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cherry text-surface transition-transform duration-150 hover:scale-105"
          >
            <BagIcon className="h-5 w-5" strokeWidth={2} />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            data-cursor-label="Menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-surface-warm hover:text-cherry md:hidden"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-display text-2xl text-foreground">Zella</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                data-cursor-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-surface-warm hover:text-cherry"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-6 pt-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenus}
                    className="block font-display text-4xl text-foreground transition-colors hover:text-cherry"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
