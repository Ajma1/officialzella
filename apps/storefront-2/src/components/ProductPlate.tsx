import Image from "next/image";

/** The "book plate" photo treatment: sepia-toned, matted in a thin surface
 *  border — every real product photo goes through this, never a bare crop.
 *  Falls back to the colorway swatch fill when a product has no photo yet. */
export default function ProductPlate({
  src,
  alt,
  swatch,
  ratio = "3 / 4",
  sizes = "(min-width: 768px) 33vw, 100vw",
}: {
  src: string | null;
  alt: string;
  swatch: string;
  ratio?: string;
  sizes?: string;
}) {
  if (!src) {
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
      <Image src={src} alt={alt} fill sizes={sizes} style={{ objectFit: "cover", objectPosition: "50% 22%" }} />
    </div>
  );
}
