import { describe, expect, it, vi } from "vitest";

vi.mock("@zella/core/catalog", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    { slug: "test-shirt", updatedAt: undefined },
  ]),
}));

describe("sitemap", () => {
  it("includes static routes and every product slug", async () => {
    const { default: sitemap } = await import("../sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://officialzella.com");
    expect(urls).toContain("https://officialzella.com/shirts");
    expect(urls).toContain("https://officialzella.com/trousers");
    expect(urls).toContain("https://officialzella.com/pair");
    expect(urls).toContain("https://officialzella.com/products/test-shirt");
  });
});
