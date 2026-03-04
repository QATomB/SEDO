import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://sedo-backend.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error: ", err);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("response from target:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  test: {
    globals: true,
    setupFiles: "./src/tests/setup.ts",
    environment: "jsdom",
  },
});
