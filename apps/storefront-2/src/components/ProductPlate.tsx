"use client";

import { useState } from "react";
import Image from "next/image";

/** The "book plate" photo treatment: sepia-toned, matted in a thin surface
 *  border — every real product photo goes through this, never a bare crop.
 *  Falls back to the colorway swatch fill when a product has no photo yet,
 *  or when the photo fails to load client-side (flaky connection, dead
 *  URL) — never the browser's bare broken-image icon. */
export default function ProductPlate({
  src,
  alt,
  swatch,
  ratio = "3 / 4",
  sizes = "(min-width: 768px) 33vw, 100vw",
  quality = 90,
}: {
  src: string | null;
  alt: string;
  swatch: string;
  ratio?: string;
  sizes?: string;
  quality?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="plate"
        style={{
          width: "100%",
          aspectRatio: ratio,
          background: swatch,
          display: "flex",
          alignItems: "flex-end",
          padding: 16,
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-900)" }}>
          Photography coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="plate" style={{ position: "relative", width: "100%", aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        style={{ objectFit: "cover", objectPosition: "50% 22%" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
