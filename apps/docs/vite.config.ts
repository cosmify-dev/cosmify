/// <reference types='vitest' />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/docs",
  server: {
    port: 4200,
    host: "localhost"
  },
  preview: {
    port: 4300,
    host: "localhost"
  },
  plugins: [vue()],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
      vue: "vue/dist/vue.esm-bundler.js"
    },
    dedupe: ["vue"]
  }
});
