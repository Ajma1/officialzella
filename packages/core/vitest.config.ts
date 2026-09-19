import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 15000,
    globalSetup: ["./vitest.global-teardown.ts"],
  },
});
