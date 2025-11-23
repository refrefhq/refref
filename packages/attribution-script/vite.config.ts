import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import path from "path";

export default defineConfig(({ mode }) => ({
  configLoader: "runner",
  envDir: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    // to emit types for dev purposes?
    dts({
      insertTypesEntry: true,
      outDir: "dist/types",
      exclude: ["src/**/*.test.ts"],
    }),
  ],
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "RefRefAttribution",
      fileName: (format) => `attribution-script.${format}.js`,
      formats: ["es", "umd"],
    },
    minify: mode === "production" ? "esbuild" : false,
    cssCodeSplit: false,
    sourcemap: mode !== "production",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        compact: true,
        generatedCode: {
          constBindings: true,
        },
      },
      treeshake: {
        preset: "recommended",
        moduleSideEffects: false,
      },
    },
  },
}));
