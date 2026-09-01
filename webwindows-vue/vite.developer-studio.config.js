import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    outDir: resolve(currentDirectory, "../dist-developer-studio"),
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
    lib: {
      entry: resolve(currentDirectory, "src/developer-studio/entry.js"),
      formats: ["es"],
      fileName: () => "developer-studio.js",
      cssFileName: "developer-studio-bundle"
    },
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => assetInfo.name === "developer-studio-bundle.css"
          ? "developer-studio-bundle.css"
          : "assets/[name]-[hash][extname]"
      }
    }
  }
});
