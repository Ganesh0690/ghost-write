import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    exclude: ["@provablehq/sdk"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    target: "esnext",
  },
});
