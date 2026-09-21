import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

describe("/bundles", () => {
  it("redirects to /pair", async () => {
    const { default: BundlesPage } = await import("../page");
    expect(() => BundlesPage()).toThrow("REDIRECT:/pair");
    expect(redirectMock).toHaveBeenCalledWith("/pair");
  });
});
