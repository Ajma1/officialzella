import { describe, expect, it } from "vitest";
import { toggleZoom } from "../zoom";

describe("toggleZoom", () => {
  it("zooms in toward the click point when not zoomed", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    const result = toggleZoom({ clickX: 50, clickY: 25, rect, zoomed: false });
    expect(result).toEqual({ zoomed: true, originX: 25, originY: 25, scale: 2.5 });
  });

  it("zooms back out and drops the origin when already zoomed", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    const result = toggleZoom({ clickX: 50, clickY: 25, rect, zoomed: true });
    expect(result).toEqual({ zoomed: false, originX: 50, originY: 50, scale: 1 });
  });

  it("clamps the origin to the image bounds for clicks at the edge", () => {
    const rect = { left: 10, top: 10, width: 200, height: 100 } as DOMRect;
    const result = toggleZoom({ clickX: 10, clickY: 110, rect, zoomed: false });
    expect(result.originX).toBe(0);
    expect(result.originY).toBe(100);
  });
});
