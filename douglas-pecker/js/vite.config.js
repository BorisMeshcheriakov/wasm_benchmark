import { defineConfig } from "vite";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(() => {

  return {
    build: {
      outDir: "dist",
    },
    publicDir: "./public",
    plugins: [
      viteStaticCopy({
        targets: [{
          src: path.resolve(__dirname, "../mock-generator/results") + "/*", dest: ".", // копируем прямо в dist/ 
        }]
      })
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      fs: {
        allow: [
          path.resolve(__dirname),
          path.resolve(__dirname, "../mock-generator"),
        ],
      },
    },
  }
});
