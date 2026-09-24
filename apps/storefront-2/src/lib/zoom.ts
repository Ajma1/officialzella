const ZOOM_SCALE = 2.5;

/** Click-to-zoom toggle: zooming in anchors the transform-origin at the
 *  click point (clamped to the image bounds); zooming out resets to center. */
export function toggleZoom({
  clickX,
  clickY,
  rect,
  zoomed,
}: {
  clickX: number;
  clickY: number;
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">;
  zoomed: boolean;
}) {
  if (zoomed) {
    return { zoomed: false, originX: 50, originY: 50, scale: 1 };
  }

  const originX = clamp(((clickX - rect.left) / rect.width) * 100, 0, 100);
  const originY = clamp(((clickY - rect.top) / rect.height) * 100, 0, 100);
  return { zoomed: true, originX, originY, scale: ZOOM_SCALE };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
