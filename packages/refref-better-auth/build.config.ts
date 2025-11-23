import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    {
      input: "./src/index",
      outDir: "./dist",
      name: "index",
      format: ["cjs", "esm"],
    },
  ],
  declaration: true,
  clean: true,
  failOnWarn: false, // Don't fail on warnings
  rollup: {
    emitCJS: true,
    esbuild: {
      target: "node16",
    },
  },
  externals: ["better-auth", "zod"],
});
