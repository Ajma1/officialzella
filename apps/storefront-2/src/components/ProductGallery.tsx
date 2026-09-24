"use client";

import { useRef, useState, type MouseEvent, type WheelEvent } from "react";
import Image from "next/image";
import type { ProductImage } from "@zella/core/catalog-types";
import ProductPlate from "./ProductPlate";
import { toggleZoom } from "@/lib/zoom";

/** Horizontally scrollable filmstrip of product photos. Click any photo to
 *  open it full-size in a native <dialog> lightbox; click the lightbox photo
 *  to zoom in toward the click point, click again to zoom back out — when
 *  zoomed, the browser's own scroll/drag pans the overflow, no drag code. */
export default function ProductGallery({
  images,
  productName,
  swatch,
  ratio,
}: {
  images: ProductImage[];
  productName: string;
  swatch: string;
  ratio: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState({ zoomed: false, originX: 50, originY: 50, scale: 1 });

  if (images.length === 0) {
    return <ProductPlate src={null} alt={productName} swatch={swatch} ratio={ratio} />;
  }

  function openLightbox(index: number) {
    setActiveIndex(index);
    setZoom({ zoomed: false, originX: 50, originY: 50, scale: 1 });
    dialogRef.current?.showModal();
  }

  function onFilmstripWheel(e: WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.currentTarget.scrollLeft += e.deltaY;
    e.preventDefault();
  }

  function onLightboxImageClick(e: MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom((prev) =>
      toggleZoom({ clickX: e.clientX, clickY: e.clientY, rect, zoomed: prev.zoomed }),
    );
  }

  function onDialogClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  }

  const active = images[activeIndex];

  return (
    <>
      <div className="gallery-filmstrip" onWheel={onFilmstripWheel}>
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            className="gallery-item"
            onClick={() => openLightbox(i)}
            aria-label={`View ${img.alt || productName} full size`}
          >
            <ProductPlate src={img.url} alt={img.alt || productName} swatch={swatch} ratio={ratio} />
          </button>
        ))}
      </div>

      <dialog ref={dialogRef} className="gallery-lightbox" onClick={onDialogClick}>
        <div className="gallery-lightbox-frame" style={{ overflow: zoom.zoomed ? "auto" : "hidden" }}>
          <Image
            key={active.url}
            src={active.url}
            alt={active.alt || productName}
            fill
            sizes="100vw"
            quality={90}
            style={{
              objectFit: "contain",
              cursor: zoom.zoomed ? "zoom-out" : "zoom-in",
              transform: `scale(${zoom.scale})`,
              transformOrigin: `${zoom.originX}% ${zoom.originY}%`,
              transition: "transform 220ms var(--ease-editorial)",
            }}
            onClick={onLightboxImageClick}
          />
        </div>
      </dialog>
    </>
  );
}
