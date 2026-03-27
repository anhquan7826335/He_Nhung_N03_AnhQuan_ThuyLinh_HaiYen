import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev mode: tự động forward /api và /socket.io → backend :5000
      "/api":       { target: "http://localhost:5000", changeOrigin: true },
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
  build: {
    // Build output vào client/dist — Express sẽ serve từ đây
    outDir: "dist",
  },
});
