import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" throws when resolved outside Next.js's bundler (it has no
      // browser/node export of its own) — stub it out for plain Vitest runs.
      "server-only": path.resolve(__dirname, "src/lib/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
