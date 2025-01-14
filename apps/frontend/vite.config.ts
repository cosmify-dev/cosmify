/// <reference types='vitest' />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/frontend",
  server: {
    port: 5173,
    host: "localhost"
  },
  preview: {
    port: 5174,
    host: "localhost"
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
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
