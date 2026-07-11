import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so tests run from the project root (the build
// config sets root to ./src, which would hide the tests/ directory).
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
