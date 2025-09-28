import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

const proxyTarget =
  process.env.VITE_PROXY_TARGET ||
  "https://phase-5-group-7-moringadesk.onrender.com";

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    hmr: { overlay: false }, 
    proxy: {
      // All requests beginning with /api will be proxied to the backend
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

