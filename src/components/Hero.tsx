"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, MotionConfig, type Variants } from "motion/react";
import {
  ArrowIcon,
  BagIcon,
  BowIcon,
  CherryIcon,
  HeartIcon,
  SparkleIcon,
} from "@/components/icons";

const swatches = [
  { name: "Burgundy", className: "bg-burgundy" },
  { name: "Lilac", className: "bg-lilac" },
  { name: "Mocha stripe", className: "bg-mocha" },
  { name: "Sky stripe", className: "bg-sky" },
  { name: "Yellow stripe", className: "bg-butter" },
  { name: "Blue stripe", className: "bg-denim" },
];

const tickerItems = [
  "100% cotton",
  "relaxed fit",
  "shirts & trousers",
  "for girls who move",
  "new season",
];

const stickers = [
  { Icon: BowIcon, top: "14%", left: "44%", size: 34, delay: 0, rotate: -8 },
  { Icon: HeartIcon, top: "72%", left: "38%", size: 26, delay: 0.6, rotate: 10 },
  { Icon: CherryIcon, top: "8%", left: "8%", size: 30, delay: 1.1, rotate: -4 },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const words: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
  },
};

export default function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-background-deep/40 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-24 h-[30rem] w-[30rem] rounded-full bg-cherry-bright/20 blur-[110px]"
        />
        <div aria-hidden className="grain" />

        {stickers.map(({ Icon, top, left, size, delay, rotate }, i) => (
          <div
            key={i}
            aria-hidden
            className="animate-float pointer-events-none absolute hidden sm:block"
            style={
              {
                top,
                left,
                animationDelay: `${delay}s`,
                "--float-rot": `${rotate}deg`,
                "--float-rot-alt": `${-rotate}deg`,
              } as React.CSSProperties
            }
          >
            <Icon size={size} />
          </div>
        ))}

        <header className="relative z-10 px-4 pt-5 sm:px-8 sm:pt-6 lg:px-14">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full bg-surface/95 py-2.5 pl-5 pr-2.5 shadow-lg shadow-background-deep/20 backdrop-blur-sm">
            <a
              href="#"
              data-cursor-label="Home"
              className="flex items-center gap-1.5 font-display text-2xl tracking-tight text-foreground"
            >
              Zella
              <BowIcon size={16} className="translate-y-[-2px] text-cherry" />
            </a>

            <nav className="hidden items-center gap-1 text-sm font-semibold text-foreground/80 md:flex">
              <a
                href="#shirts"
                data-cursor-label="View"
                className="rounded-full px-4 py-2 transition-colors duration-150 hover:bg-surface-warm hover:text-cherry"
              >
                Shirts
              </a>
              <a
                href="#trousers"
                data-cursor-label="View"
                className="rounded-full px-4 py-2 transition-colors duration-150 hover:bg-surface-warm hover:text-cherry"
              >
                Trousers
              </a>
              <a
                href="#bundles"
                data-cursor-label="View"
                className="rounded-full px-4 py-2 transition-colors duration-150 hover:bg-surface-warm hover:text-cherry"
              >
                Bundles
              </a>
              <a
                href="#story"
                data-cursor-label="Read"
                className="rounded-full px-4 py-2 transition-colors duration-150 hover:bg-surface-warm hover:text-cherry"
              >
                Our Story
              </a>
            </nav>

            <MagneticLink
              href="#cart"
              label="Cart · 0"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-cherry text-surface transition-transform duration-150"
            >
              <BagIcon className="h-5 w-5" strokeWidth={2} />
              <span className="sr-only">Cart, 0 items</span>
            </MagneticLink>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-14 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-16">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <h1 className="font-display text-[13vw] font-normal leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <motion.span variants={words} className="block overflow-hidden">
                {["Loose", "cotton."].map((word) => (
                  <span key={word} className="inline-block overflow-hidden pb-1">
                    <motion.span variants={fadeUp} className="inline-block mr-4">
                      {word}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
              <motion.span variants={words} className="relative block overflow-hidden">
                {["Made", "to", "move."].map((word) => (
                  <span key={word} className="inline-block overflow-hidden pb-1">
                    <motion.span
                      variants={fadeUp}
                      className="relative inline-block mr-4 text-cherry"
                    >
                      {word}
                      {word === "move." && (
                        <svg
                          aria-hidden
                          viewBox="0 0 140 18"
                          className="absolute -bottom-1.5 left-0 h-3 w-full text-cherry"
                        >
                          <path
                            d="M2 12C24 2 46 2 68 9C90 16 112 16 136 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={5}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
            </h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-lg leading-relaxed text-foreground"
            >
              Relaxed shirts and trousers cut from breathable cotton — roomy
              where it counts, soft against the skin, made for girls who
              don&rsquo;t sit still.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-5"
            >
              <MagneticLink
                href="#shop"
                label="Shop now"
                className="group flex h-14 items-center gap-2.5 rounded-full bg-cherry pl-6 pr-5 text-sm font-bold text-surface shadow-lg shadow-cherry/30 transition-transform duration-150"
              >
                Shop the edit
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticLink>

              <a
                href="#lookbook"
                data-cursor-label="Watch"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-foreground/40 px-4 py-2.5 font-script text-lg font-semibold text-foreground transition-colors duration-150 hover:border-cherry hover:text-cherry"
              >
                see the lookbook
                <HeartIcon size={14} />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                Colorways
              </span>
              <div className="flex -space-x-2">
                {swatches.map((swatch) => (
                  <span
                    key={swatch.name}
                    data-cursor-label={swatch.name}
                    className={`h-7 w-7 rounded-full ring-2 ring-surface transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-110 ${swatch.className}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.2, 0, 0, 1] }}
            className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none"
          >
            <Polaroid
              src="/shirt-burgundy.jpg"
              alt="Zella burgundy relaxed-fit cotton shirt, flat lay"
              label="Shirts"
              tag="Burgundy"
              className="absolute left-0 top-2 h-[58%] w-[52%]"
              rotate={-7}
              delay={0.5}
              sizes="(min-width: 1024px) 20rem, 50vw"
            />
            <Polaroid
              src="/shirt-lilac.jpg"
              alt="Zella lilac relaxed-fit cotton shirt, flat lay"
              label="Shirts"
              tag="Lilac"
              className="absolute right-0 top-0 h-[54%] w-[50%]"
              rotate={6}
              delay={0.65}
              priority
              sizes="(min-width: 1024px) 19rem, 48vw"
            />
            <Polaroid
              src="/shirt-yellow-stripe.jpg"
              alt="Zella yellow-stripe relaxed-fit cotton shirt, flat lay"
              label="Trousers"
              tag="Yellow stripe"
              className="absolute bottom-0 right-2 h-[52%] w-[56%]"
              rotate={-3}
              delay={0.8}
              sizes="(min-width: 1024px) 21rem, 52vw"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 160, damping: 12, delay: 1 }}
              className="animate-float absolute left-[38%] top-[2%] z-20 flex h-24 w-24 flex-col items-center justify-center gap-0.5 rounded-full bg-cherry text-center text-surface shadow-xl shadow-background-deep/40"
              style={{ "--float-rot": "-8deg", "--float-rot-alt": "-4deg" } as React.CSSProperties}
            >
              <SparkleIcon size={16} className="animate-sparkle" />
              <span className="font-script text-xl leading-none">new</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                season edit
              </span>
            </motion.div>

            <div className="absolute -left-8 top-1/2 hidden -translate-y-1/2 sm:block">
              <RotatingBadge />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 overflow-hidden border-t-4 border-surface/40 bg-surface py-4">
          <div className="flex w-max animate-marquee gap-10">
            {[0, 1].map((rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10">
                {tickerItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-10 whitespace-nowrap text-sm font-bold uppercase tracking-[0.25em] text-cherry"
                  >
                    {item}
                    <HeartIcon size={14} className="text-foreground/40" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Polaroid({
  src,
  alt,
  label,
  tag,
  className,
  rotate,
  delay,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  label: string;
  tag: string;
  className?: string;
  rotate: number;
  delay: number;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <motion.div
      data-cursor-label={label}
      initial={{ opacity: 0, rotate: rotate * 3, scale: 0.85, y: 24 }}
      animate={{ opacity: 1, rotate, scale: 1, y: 0 }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 20 }}
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 13,
        mass: 0.6,
        delay,
      }}
      className={`${className} rounded-[18px] bg-surface p-2.5 pb-6 shadow-2xl shadow-background-deep/30`}
    >
      <div className="image-outline relative h-full w-full overflow-hidden rounded-[10px] bg-surface-warm">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
      <span className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 rounded-sm bg-sunshine/90 shadow-sm" />
      <span className="absolute bottom-1.5 left-3 font-script text-base text-foreground/70">
        {tag}
      </span>
    </motion.div>
  );
}

function MagneticLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.35,
      y: (e.clientY - rect.top - rect.height / 2) * 0.45,
    });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      data-cursor-label={label}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

function RotatingBadge() {
  const text = "LOOSE COTTON • MADE TO MOVE • ";
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow">
        <defs>
          <path
            id="badge-circle"
            d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
          />
        </defs>
        <text fontSize="7.2" letterSpacing="1.5" className="fill-foreground font-sans font-bold">
          <textPath href="#badge-circle">{text.repeat(2)}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cherry text-surface shadow-lg shadow-background-deep/40">
          <HeartIcon size={22} filled />
        </span>
      </div>
    </div>
  );
}
