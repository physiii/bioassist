/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/@mui/") ||
            id.includes("/node_modules/@emotion/") ||
            id.includes("/node_modules/react") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "ui-vendor";
          }
          if (id.includes("/node_modules/axios/")) return "api-vendor";
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:4000",
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts"
  }
});
