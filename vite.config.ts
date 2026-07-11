import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./src", import.meta.url));

// Chrome extension build: two entry points (popup page + background service
// worker). Static assets (manifest.json, icons/) live in ./public and are
// copied verbatim to the dist root so their paths match the manifest.
export default defineConfig({
  root,
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        popup: resolve(root, "popup/popup.html"),
        "service-worker": resolve(root, "background/service-worker.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "service-worker"
            ? "background/service-worker.js"
            : "[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
