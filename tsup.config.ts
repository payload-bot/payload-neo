import { defineConfig } from "tsup";

export default defineConfig({
  clean: false,
  bundle: false,
  dts: false,
  entry: ["src/**/*.ts", "!src/**/*.d.ts", "!src/languages/*"],
  format: ["cjs"],
  minify: false,
  tsconfig: "tsconfig.json",
  target: "es2020",
  splitting: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  shims: false,
  keepNames: true,
});
