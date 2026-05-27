import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "bin/speclite": "src/bin/speclite.ts",
  },
  format: ["esm"],
  target: "node22",
  platform: "node",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: "dist",
});
