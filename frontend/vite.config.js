import { defineConfig, loadEnv } from "vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const rootDir = dirname(fileURLToPath(new URL(".", import.meta.url)));
  const env = loadEnv(mode, rootDir, "");
  const proxyTarget =
    env.VITE_PROXY_TARGET || "https://phase-5-group-7-moringadesk.onrender.com";

  return {
    plugins: [react(), tailwind()],
    server: {
      hmr: { overlay: false },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
